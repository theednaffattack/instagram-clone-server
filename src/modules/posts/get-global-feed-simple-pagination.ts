import { format, parseISO } from "date-fns";
import {
  Args,
  Ctx,
  Field,
  ObjectType,
  Query,
  Resolver,
  ResolverFilterData,
  Root,
  Subscription,
  UseMiddleware,
} from "type-graphql";
import { Post } from "../../entity/Post";
import { ConnectionArgs } from "../../relay.connection-args";
import { MyContext } from "../../types/MyContext";
import { GlobalPostReturnType } from "../../types/PostReturnTypes";
import { logger } from "../middleware/logger";

const formatDate = (date: any) => format(date, "yyyy-MM-dd HH:mm:ss");

@ObjectType()
class PaginatedPosts {
  @Field(() => [GlobalPostReturnType])
  posts: GlobalPostReturnType[];

  @Field()
  hasMore: boolean;
}

@Resolver()
export class GetGlobalPostsSimplePaginationResolver {
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
    }: ResolverFilterData<GlobalPostReturnType, ConnectionArgs>) => {
      return true;
    },
  })
  // this is the actual class method that activates?
  // the subscribe.
  globalPostsRelay(
    @Root() postPayload: GlobalPostReturnType
  ): GlobalPostReturnType {
    return postPayload;
  }

  @Query(() => PaginatedPosts, {
    name: "getGlobalPostsSimplePagination",
    nullable: true,
  })
  @UseMiddleware(logger)
  async getGlobalPostsSimplePagination(
    @Ctx() ctx: MyContext,

    @Args()
    {
      after,
      // @ts-ignore
      before,
      first,
      // @ts-ignore
      last,
    }: ConnectionArgs
  ): // @PubSub("GLOBAL_POSTS") publish: Publisher<GlobalPostReturnType>
  Promise<PaginatedPosts> {
    console.log("'getGlobalPostsSimplePagination' RESOLVER FIRING");

    const realLimit = Math.min(50, first || 50);
    const realLimitPlusOne = realLimit + 1;

    const postsQb = Post.createQueryBuilder("post")
      .leftJoinAndSelect("post.images", "images")
      .leftJoinAndSelect("post.comments", "comments")
      .leftJoinAndSelect("post.user", "user")
      .leftJoinAndSelect("user.followers", "followers")
      .leftJoinAndSelect("post.likes", "likes")
      .leftJoinAndSelect("likes.user", "likeUser")
      .orderBy("post.created_at", "DESC")
      // .skip(first)
      .take(realLimitPlusOne);

    // conditionally apply the cursor
    if (after) {
      postsQb.where("post.created_at <= :cursor::timestamp", {
        cursor: formatDate(after ? parseISO(after) : new Date()),
      });
    }

    // Execute the query
    const findPosts = await postsQb.getMany();

    // We need to remove the extra record we fetched and
    // put these in reverse order.
    const preppedPosts = findPosts.slice(0, realLimit); // .reverse();

    let currentlyLiked;

    // Manually add follower status and whether
    // the user currently likes this post.
    let paginatedReturn: PaginatedPosts = {
      hasMore: findPosts.length === realLimitPlusOne,
      posts: preppedPosts.map((post) => {
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
      }),
    };

    // await publish(addFollowerStatusToGlobalPosts).catch((error: Error) => {
    //   throw new Error(error.message);
    // });
    console.log("LENGTH OF  POSTS", paginatedReturn);

    return paginatedReturn;
  }
}
