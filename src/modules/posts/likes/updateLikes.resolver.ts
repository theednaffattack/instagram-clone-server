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
  ObjectType
} from "type-graphql";

import { isAuth } from "../../middleware/isAuth";
import { logger } from "../../middleware/logger";
import { MyContext } from "../../../types/MyContext";
import { Post } from "../../../entity/Post";
import { Like } from "../../../entity/Like";
import { User } from "../../../entity/User";
import { registerEnum } from "../../../modules/type-graphql/RegisterEnum";

enum LikeStatus {
  Created = "CREATED",
  Deleted = "DELETED",
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

@Resolver()
export class CreateOrUpdateLikes {
  @UseMiddleware(isAuth, logger)
  @Mutation(() => LikeReturnType, {
    name: "createOrUpdateLikes",
    nullable: true
  })
  async createOrUpdateLikes(
    @PubSub("LIKES_UPDATED") publishLikesUpdate: Publisher<LikeReturnType>,
    @Arg("input", () => UpdateLikesInput)
    input: UpdateLikesInput,
    @Ctx() ctx: MyContext
  ): Promise<LikeReturnType> {
    // A - check if the user has already liked the post

    // SCENARIO - 1 - IF LIKE WAS FOUND:
    // B - decrement likes, send back count of likes

    // SCENARIO - 2 - IF LIKE WAS NOT FOUND:
    // B - increment likes, send back count of likes

    let hasTheUserLikeThisAlready = await Like.find({
      where: { user: { id: ctx.userId, posts: { id: input.postId } } },
      relations: ["user", "post"]
    });

    let getUser = await User.findOne(ctx.userId);

    let getPost = await Post.findOne(input.postId);

    let returnData: LikeReturnType;

    // SCENARIO - 1
    if (hasTheUserLikeThisAlready && hasTheUserLikeThisAlready.length > 0) {
      if (hasTheUserLikeThisAlready.length > 1) {
        // We're using Entity.find() which returns an array
        // more than one record is an issue.
        throw Error(
          `More than one like for post ${hasTheUserLikeThisAlready[0].post.id} detected!`
        );
      }
      let [likeRecordFound] = hasTheUserLikeThisAlready;
      let deletedLike = await Like.delete({ id: likeRecordFound.id });
      returnData = {
        postId: likeRecordFound.post.id,
        status: deletedLike.affected
          ? LikeStatus.Deleted
          : LikeStatus.Undetermined
      };

      publishLikesUpdate(returnData);

      return returnData;
    } else {
      // SCENARIO - 2
      if (
        !hasTheUserLikeThisAlready ||
        hasTheUserLikeThisAlready.length === 0
      ) {
        let newLike = await Like.create({
          user: getUser,
          post: getPost
        }).save();

        returnData = { postId: newLike.post.id, status: LikeStatus.Created };

        publishLikesUpdate(returnData);

        return returnData;
      }
      return { postId: "error", status: LikeStatus.Undetermined };
    }
  }

  @Subscription(() => LikeReturnType, {
    // @ts-ignore
    topics: ({ context, args, payload }) => {
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
    @Root() likesPayload: LikeReturnType,
    // @ts-ignore
    @Arg("input") input: UpdateLikesInput
  ): LikeReturnType {
    return likesPayload;
  }
}
