import {
  Resolver,
  Query,
  UseMiddleware,
  Subscription,
  ResolverFilterData,
  Root,
  Ctx,
  Args,
} from "type-graphql";
import { format, parseISO } from "date-fns";

import { logger } from "../middleware/logger";
import { Post } from "../../entity/Post";
import { PostInput } from "./createPost/CreatePostInput";
import { MyContext } from "../../types/MyContext";
import { GetGlobalPostsInput } from "./get-global-posts-input";
import { GlobalPostReturnType } from "../../types/PostReturnTypes";

const formatDate = (date: any) => format(date, "yyyy-MM-dd HH:mm:ss");

@Resolver()
export class GetGlobalPostsResolver {
  // @ts-ignore
  @Subscription((type) => GlobalPostReturnType, {
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
      context,
    }: ResolverFilterData<GlobalPostReturnType, PostInput>) => {
      return true;
    },
  })
  // this is the actual class method that activates?
  // the subscribe.
  globalPosts(@Root() postPayload: GlobalPostReturnType): GlobalPostReturnType {
    return postPayload;
  }

  @Query(() => [GlobalPostReturnType], {
    name: "getGlobalPosts",
    nullable: true,
  })
  @UseMiddleware(logger)
  async getGlobalPosts(
    @Ctx() ctx: MyContext,

    @Args()
    { cursor, skip, take }: GetGlobalPostsInput
  ): // @PubSub("GLOBAL_POSTS") publish: Publisher<GlobalPostReturnType>
  Promise<GlobalPostReturnType[]> {
    const realLimit = Math.min(50, take || 50);

    let currentlyLiked;

    const findPosts = await Post.createQueryBuilder("post")
      .leftJoinAndSelect("post.images", "images")
      .leftJoinAndSelect("post.comments", "comments")
      .leftJoinAndSelect("post.user", "user")
      .leftJoinAndSelect("user.followers", "followers")
      .leftJoinAndSelect("post.likes", "likes")
      .leftJoinAndSelect("likes.user", "likeUser")
      .where("post.created_at <= :cursor::timestamp", {
        cursor: formatDate(cursor ? parseISO(cursor) : new Date()),
      })
      .orderBy("post.created_at", "DESC")
      .skip(skip)
      .take(realLimit)
      .getMany();

    const flippedPosts = findPosts.reverse();

    let addFollowerStatusToGlobalPosts = flippedPosts.map((post) => {
      currentlyLiked =
        post && post.likes.length >= 1
          ? post.likes.filter((likeRecord) => {
              return likeRecord.user.id === ctx.userId;
            }).length > 0
          : false;

      let returnThing: GlobalPostReturnType = {
        ...post,
        isCtxUserIdAFollowerOfPostUser: post.user.followers
          .map((follower) => follower.id)
          .includes(ctx.userId),
        likes_count: post.likes.length,
        comments_count: post.comments.length,
        currently_liked: currentlyLiked,
        success: true,
        action: "CREATE",
      };

      return returnThing;
    });

    // const startCursor = formatDate(cursor ? parseISO(cursor) : new Date());

    // const cursorNoRecordsErrorMessage =
    //   "no 'created_at' record present to create new cursor";

    // const newCursor =
    //   flippedPosts[0] && flippedPosts[0].created_at
    //     ? flippedPosts[0].created_at.toISOString()
    //     : cursorNoRecordsErrorMessage;

    // // get messages before cursor position
    // const postsBeforeCursor =
    //   newCursor === cursorNoRecordsErrorMessage
    //     ? false
    //     : await Post.createQueryBuilder("post")
    //         .leftJoinAndSelect("post.images", "images")
    //         .leftJoinAndSelect("post.comments", "comments")
    //         .leftJoinAndSelect("post.user", "user")
    //         .leftJoinAndSelect("user.followers", "followers")
    //         .leftJoinAndSelect("post.likes", "likes")
    //         .leftJoinAndSelect("likes.user", "likeUser")
    //         .where("post.created_at <= :cursor::timestamp", {
    //           cursor: formatDate(cursor ? parseISO(cursor) : new Date()),
    //         })
    //         .orderBy("post.created_at", "DESC")
    //         .skip(skip)
    //         .take(realLimit)
    //         .getMany();

    // // get messages AFTER cursor position
    // const postsAfterCursor = await Post.createQueryBuilder("post")
    //   .leftJoinAndSelect("post.images", "images")
    //   .leftJoinAndSelect("post.comments", "comments")
    //   .leftJoinAndSelect("post.user", "user")
    //   .leftJoinAndSelect("user.followers", "followers")
    //   .leftJoinAndSelect("post.likes", "likes")
    //   .leftJoinAndSelect("likes.user", "likeUser")
    //   .where("post.created_at >= :cursor::timestamp", {
    //     cursor: formatDate(cursor ? parseISO(cursor) : new Date()),
    //   })
    //   .orderBy("post.created_at", "DESC")
    //   .skip(skip)
    //   .take(realLimit)
    //   .getMany();

    // let relayCompatibleResponse = {
    //   edges: flippedPosts.map((post) => {
    //     const myCurrentlyLiked =
    //       post && post.likes.length >= 1
    //         ? post.likes.filter((likeRecord) => {
    //             return likeRecord.user.id === ctx.userId;
    //           }).length > 0
    //         : false;

    //     return {
    //       node: {
    //         ...post,
    //         isCtxUserIdAFollowerOfPostUser: post.user.followers
    //           .map((follower) => follower.id)
    //           .includes(ctx.userId),
    //         likes_count: post.likes.length,
    //         comments_count: post.comments.length,
    //         currently_liked: myCurrentlyLiked,
    //         success: true,
    //         action: "CREATE",
    //       },
    //     };
    //   }),
    //   pageInfo: {
    //     startCursor, // return inside 'edges'?
    //     endCursor: newCursor, // return inside 'edges'?
    //     hasNextPage: postsAfterCursor.length > 0 ? true : false,
    //     hasPreviousPage:
    //       postsBeforeCursor && postsBeforeCursor.length > 0 ? true : false,
    //   },
    // };

    // await publish(addFollowerStatusToGlobalPosts).catch((error: Error) => {
    //   throw new Error(error.message);
    // });

    return addFollowerStatusToGlobalPosts;
  }
}
