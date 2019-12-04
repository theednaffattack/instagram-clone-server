import {
  Resolver,
  Query,
  UseMiddleware,
  Subscription,
  ResolverFilterData,
  Root,
  Ctx,
  PubSub,
  Publisher,
  Arg
} from "type-graphql";
import { format, parseISO } from "date-fns";

import { isAuth } from "../middleware/isAuth";
import { logger } from "../middleware/logger";
import { Post } from "../../entity/Post";
import { PostInput } from "./createPost/CreatePostInput";
import { MyContext } from "../../types/MyContext";
import { FollowingPostReturnType } from "../../types/PostReturnTypes";
import { GetGlobalPostsInput } from "./get-global-posts-input";
import { PaginatedPostResponse } from "./paginated-post-response";

const formatDate = (date: any) => format(date, "yyyy-MM-dd HH:mm:ss");

@Resolver()
export class GetGlobalPostsResolver {
  // @ts-ignore
  @Subscription(type => PaginatedPostResponse, {
    // the `payload` and `args` are available in the destructured
    // object below `{args, context, payload}`
    nullable: true,
    topics: ({ context }) => {
      if (!context.userId) {
        throw new Error("not authed");
      }
      return "POSTS_GLOBAL";
    },

    // @ts-ignore
    filter: ({
      payload,
      context
    }: ResolverFilterData<PaginatedPostResponse, PostInput>) => {
      return true;
    }
  })
  // this is the actual class method that activates?
  // the subscribe.
  globalPosts(
    @Root() postPayload: FollowingPostReturnType
  ): PaginatedPostResponse {
    let node = postPayload;

    // Because the GetGlobalPosts query feed expects a paginated
    // but the CreatePost mutation is in a different format
    // we convert the subscription here
    let convertReturnType: PaginatedPostResponse = {
      edges: [{ node }],
      pageInfo: {
        startCursor: postPayload.created_at.toString(),
        endCursor: postPayload.created_at.toString(),
        hasNextPage: false,
        hasPreviousPage: false
      }
    };

    console.log("VIEW THE CONVERSION", convertReturnType);

    return convertReturnType;
  }

  @Query(() => PaginatedPostResponse, {
    name: "getGlobalPosts",
    nullable: true
  })
  @UseMiddleware(isAuth, logger)
  async getGlobalPosts(
    @Ctx() ctx: MyContext,

    @Arg("input", () => GetGlobalPostsInput)
    input: GetGlobalPostsInput,

    @PubSub("GLOBAL_POSTS") publish: Publisher<any>
    // @PubSub("POSTS_GLOBAL") publishGlbl: Publisher<PostPayload>,
  ): Promise<PaginatedPostResponse> {
    // NEW STUFF BELOW

    let currentlyLiked;

    const findPosts = await Post.createQueryBuilder("post")
      .leftJoinAndSelect("post.images", "images")
      .leftJoinAndSelect("post.comments", "comments")
      .leftJoinAndSelect("post.user", "user")
      .leftJoinAndSelect("user.followers", "followers")
      .leftJoinAndSelect("post.likes", "likes")
      .where("post.created_at <= :cursor::timestamp", {
        cursor: formatDate(input.cursor ? parseISO(input.cursor) : new Date())
      })
      .orderBy("post.created_at", "DESC")
      .take(input.take)
      .getMany();

    const flippedPosts = findPosts.reverse();

    const startCursor = input.cursor ? input.cursor : new Date().toISOString();

    const cursorNoRecordsErrorMessage =
      "no 'created_at' record present to create new cursor";

    const newCursor =
      flippedPosts[0] && flippedPosts[0].created_at
        ? flippedPosts[0].created_at.toISOString()
        : cursorNoRecordsErrorMessage;

    const beforeMessages =
      newCursor === cursorNoRecordsErrorMessage
        ? false
        : await Post.createQueryBuilder("post")
            .leftJoinAndSelect("post.images", "images")
            .leftJoinAndSelect("post.comments", "comments")
            .leftJoinAndSelect("post.user", "user")
            .leftJoinAndSelect("user.followers", "followers")
            .leftJoinAndSelect("post.likes", "likes")
            // .where("user.id = :user_id", { user_id: context.userId })
            .andWhere("post.created_at <= :cursor::timestamp", {
              cursor: formatDate(parseISO(newCursor))
            })
            .orderBy("post.created_at", "DESC")
            .take(input.take)
            .getMany();

    const afterMessages = await Post.createQueryBuilder("post")
      .leftJoinAndSelect("post.images", "images")
      .leftJoinAndSelect("post.comments", "comments")
      .leftJoinAndSelect("post.user", "user")
      .leftJoinAndSelect("user.followers", "followers")
      .leftJoinAndSelect("post.likes", "likes")
      .andWhere("post.created_at >= :cursor::timestamp", {
        cursor: formatDate(input.cursor ? parseISO(startCursor) : new Date())
      })
      .orderBy("post.created_at", "DESC")
      .take(input.take)
      .getMany();

    let addFollowerStatusToGlobalPosts = flippedPosts.map(post => {
      currentlyLiked =
        post && post.likes.length >= 1
          ? post.likes.filter(likeRecord => {
              return likeRecord.user.id === ctx.userId;
            }).length > 0
          : false;

      return {
        isCtxUserIdAFollowerOfPostUser: post.user.followers
          .map(follower => follower.id)
          .includes(ctx.userId),
        ...post,
        likes_count: post.likes.length,
        comments_count: post.comments.length,
        currently_liked: currentlyLiked,
        success: true,
        action: "CREATE"
      };
    });

    console.log({ addFollowerStatusToGlobalPosts });

    let response: PaginatedPostResponse = {
      edges: addFollowerStatusToGlobalPosts.map(post => {
        return { node: post };
      }),
      pageInfo: {
        startCursor,
        endCursor: newCursor,
        hasNextPage: afterMessages.length > 0 ? true : false,
        hasPreviousPage:
          beforeMessages && beforeMessages.length > 0 ? true : false
      }
    };

    await publish(addFollowerStatusToGlobalPosts).catch((error: Error) => {
      throw new Error(error.message);
    });
    return response;

    // OLD STUFF BELOW

    // const findOptions = {
    //   where: {},
    //   relations: [
    //     "images",
    //     "comments",
    //     "user",
    //     "user.followers",
    //     "likes",
    //     "likes.user"
    //   ]
    // };

    // let globalPosts = await Post.find(findOptions);

    // let addFollowerStatusToGlobalPosts = globalPosts.map(post => {
    //   currentlyLiked =
    //     post && post.likes.length >= 1
    //       ? post.likes.filter(likeRecord => {
    //           return likeRecord.user.id === ctx.userId;
    //         }).length > 0
    //       : false;

    //   return {
    //     isCtxUserIdAFollowerOfPostUser: post.user.followers
    //       .map(follower => follower.id)
    //       .includes(ctx.userId),
    //     ...post,
    //     likes_count: post.likes.length,
    //     comments_count: post.comments.length,
    //     currently_liked: currentlyLiked,
    //     success: true,
    //     action: "CREATE"
    //   };
    // });

    // if (addFollowerStatusToGlobalPosts) {
    //   await publish(addFollowerStatusToGlobalPosts).catch((error: Error) => {
    //     throw new Error(error.message);
    //   });

    //   return addFollowerStatusToGlobalPosts;
    // } else {
    //   throw Error("cannot find global posts");
    // }
  }
}
