import {
  Resolver,
  Query,
  UseMiddleware,
  Subscription,
  ResolverFilterData,
  Root,
  Ctx,
  Args
} from "type-graphql";
import { format, parseISO } from "date-fns";

import { isAuth } from "../middleware/isAuth";
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
  @Subscription(type => GlobalPostReturnType, {
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
    }: ResolverFilterData<GlobalPostReturnType, PostInput>) => {
      return true;
    }
  })
  // this is the actual class method that activates?
  // the subscribe.
  globalPosts(@Root() postPayload: GlobalPostReturnType): GlobalPostReturnType {
    return postPayload;
  }

  @Query(() => [GlobalPostReturnType], {
    name: "getGlobalPosts",
    nullable: true
  })
  @UseMiddleware(isAuth, logger)
  async getGlobalPosts(
    @Ctx() ctx: MyContext,

    @Args()
    { cursor, skip, take }: GetGlobalPostsInput
  ): // @PubSub("GLOBAL_POSTS") publish: Publisher<GlobalPostReturnType>
  Promise<GlobalPostReturnType[]> {
    // NEW STUFF BELOW

    let currentlyLiked;

    const findPosts = await Post.createQueryBuilder("post")
      .leftJoinAndSelect("post.images", "images")
      .leftJoinAndSelect("post.comments", "comments")
      .leftJoinAndSelect("post.user", "user")
      .leftJoinAndSelect("user.followers", "followers")
      .leftJoinAndSelect("post.likes", "likes")
      .leftJoinAndSelect("likes.user", "likeUser")
      .where("post.created_at <= :cursor::timestamp", {
        cursor: formatDate(cursor ? parseISO(cursor) : new Date())
      })
      .orderBy("post.created_at", "DESC")
      .skip(skip)
      .take(take)
      .getMany();

    const flippedPosts = findPosts.reverse();

    let addFollowerStatusToGlobalPosts = flippedPosts.map(post => {
      currentlyLiked =
        post && post.likes.length >= 1
          ? post.likes.filter(likeRecord => {
              return likeRecord.user.id === ctx.userId;
            }).length > 0
          : false;

      let returnThing: GlobalPostReturnType = {
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

      return returnThing;
    });

    // await publish(addFollowerStatusToGlobalPosts).catch((error: Error) => {
    //   throw new Error(error.message);
    // });

    return addFollowerStatusToGlobalPosts;
  }
}
