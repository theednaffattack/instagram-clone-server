import {
  Resolver,
  Ctx,
  UseMiddleware,
  Arg,
  InputType,
  Field,
  ID,
  Mutation,
  Subscription,
  ResolverFilterData,
  Root,
  PubSub,
  Publisher,
  ObjectType,
  Int
} from "type-graphql";
import { DeleteResult, InsertResult } from "typeorm";

import { isAuth } from "../../middleware/isAuth";
import { logger } from "../../middleware/logger";
import { MyContext } from "../../../types/MyContext";
import { Like } from "../../../entity/Like";
import { registerEnum } from "../../../modules/type-graphql/RegisterEnum";

export enum LikeStatus {
  Created = "CREATED",
  Deleted = "DELETED",
  CountUpdated = "COUNT_UPDATED",
  Undetermined = "UNDETERMINED"
}

registerEnum(
  LikeStatus,
  "LikeStatus",
  `Describes whether a like has been created or deleted in the database.`
);

@InputType()
export class UpdateLikesInput {
  @Field(() => ID)
  postId: string;
}

@ObjectType()
export class LikeReturnType {
  // @ts-ignore
  @Field(type => ID)
  postId: string;

  @Field(() => LikeStatus)
  status: LikeStatus;
}

@ObjectType()
export class LikesCountReturnType {
  // @ts-ignore
  @Field(type => ID)
  postId: string;

  @Field(() => LikeStatus)
  status: LikeStatus.CountUpdated;

  @Field(() => Int)
  count: number;
}

@Resolver()
export class CreateOrUpdateLikes {
  @UseMiddleware(isAuth, logger)
  @Mutation(() => LikeReturnType, {
    name: "createOrUpdateLikes",
    nullable: true
  })
  async createOrUpdateLikes(
    @PubSub("LIKES_UPDATED") publishLikesUpdate: Publisher<LikeReturnType>,
    @PubSub("COUNT_UPDATED")
    publishLikesCountUpdate: Publisher<LikesCountReturnType>,
    @Arg("input", () => UpdateLikesInput)
    input: UpdateLikesInput,
    @Ctx() ctx: MyContext
  ): Promise<LikeReturnType> {
    let { postId }: UpdateLikesInput = input;
    let { userId }: MyContext = ctx;

    let retrievedLikes = await Like.createQueryBuilder("likes")
      .innerJoinAndSelect("likes.post", "post")
      .innerJoinAndSelect("likes.user", "user")
      .where("post.id = :postId", {
        postId
      })
      .andWhere("user.id = :userId", {
        userId
      })
      .getOne();

    let countLikes: number;

    if (!retrievedLikes) {
      // if this user hasn't liked then add a like

      let newlyCreatedLike: InsertResult = await Like.createQueryBuilder(
        "likes"
      )
        .insert()
        .into(Like)
        .values({ user: { id: ctx.userId }, post: { id: input.postId } })
        .execute();

      let likeReturn: LikeReturnType = {
        postId: input.postId,
        status:
          newlyCreatedLike.raw[0].id &&
          typeof newlyCreatedLike.raw[0].id === "string"
            ? LikeStatus.Created
            : LikeStatus.Undetermined
      };

      countLikes = await Like.createQueryBuilder("likes")
        .innerJoinAndSelect("likes.post", "post")
        .where("post.id = :postId", {
          postId
        })
        .getCount();

      let likeCountReturn: LikesCountReturnType = {
        count: countLikes,
        postId: input.postId,
        status: LikeStatus.CountUpdated
      };

      publishLikesCountUpdate(likeCountReturn);

      publishLikesUpdate(likeReturn);

      return likeReturn;
    }

    if (retrievedLikes) {
      // if the logged in user has ALREADY liked this post...
      // then delete that user's like

      let deleteLikes: DeleteResult = await Like.createQueryBuilder("likes")
        .delete()
        .from(Like)
        .where("id = :id", { id: retrievedLikes.id })
        .execute();

      let likeReturn: LikeReturnType = {
        postId: retrievedLikes.post.id,
        status:
          deleteLikes.affected === 1
            ? LikeStatus.Deleted
            : LikeStatus.Undetermined
      };

      countLikes = await Like.createQueryBuilder("likes")
        .innerJoinAndSelect("likes.post", "post")
        .where("post.id = :postId", {
          postId
        })
        .getCount();

      let likeCountReturn: LikesCountReturnType = {
        count: countLikes,
        postId: retrievedLikes.post.id,
        status: LikeStatus.CountUpdated
      };

      publishLikesCountUpdate(likeCountReturn);

      publishLikesUpdate(likeReturn);

      return likeReturn;
    }

    throw new Error("Error updating like");
  }

  @Subscription(() => LikeReturnType, {
    topics: ({ context }) => {
      if (!context.userId) {
        throw new Error("Not authorized");
      }

      return "LIKES_UPDATED";
    },
    filter: ({
      payload,
      args
    }: ResolverFilterData<LikeReturnType, UpdateLikesInput>) => {
      if (!payload) return false;

      // @ts-ignore
      if (args.input.postId === payload.postId) {
        return true;
      } else {
        return false;
      }
    }
  })
  likesUpdated(
    @Root() likesPayload: LikeReturnType
    // @Arg("input") input: UpdateLikesInput
  ): LikeReturnType {
    return likesPayload;
  }
}
