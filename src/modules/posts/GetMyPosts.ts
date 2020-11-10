import {
  Resolver,
  Query,
  UseMiddleware,
  Ctx,
  Field,
  ID,
  Subscription,
  ResolverFilterData,
  InputType,
  Root,
  // registerEnumType
} from "type-graphql";

import {
  FollowingPostReturnType,
  HandlePostPayload,
} from "../../types/PostReturnTypes";
import { isAuth } from "../middleware/isAuth";
import { logger } from "../middleware/logger";
import { MyContext } from "../../types/MyContext";
import { User } from "../../entity/User";
import { Post } from "../../entity/Post";

// /**
//  * @type {Enum} Action - CRUD action helper
//  *
//  * ```
//  * enum Action {
//  *   Create = "CREATE",
//  *   Read = "READ",
//  *   Update = "UPDATE",
//  *   Delete = "DELETE"
//  * }
//  * ```
//  */
// enum Action {
//   Create = "CREATE",
//   Read = "READ",
//   Update = "UPDATE",
//   Delete = "DELETE"
// }

// registerEnumType(Action, {
//   name: "Action", // this one is mandatory
//   description: "An Enum to help with CRUD operations" // this one is optional
// });

@InputType()
export class PostSubscriptionInput {
  @Field()
  text: string;

  @Field({ nullable: true })
  title?: string;

  @Field(() => ID)
  user: string;

  @Field(() => [String], { nullable: "itemsAndList" })
  images: string[];
}

@Resolver()
export class MyFollowingPostsResolver {
  @UseMiddleware(isAuth, logger)
  @Subscription(() => HandlePostPayload, {
    // @ts-ignore
    topics: ({ context }: any) => {
      console.log("WHAT IS CONTEXT Objects?", Object.keys(context));
      if (!context.userId) {
        throw new Error("Not authorized for this topic");
      }

      return "GLOBAL_POSTS";
    },

    // @ts-ignore
    filter: ({
      payload,
      args,
    }: ResolverFilterData<HandlePostPayload, PostSubscriptionInput>) => {
      // filter for those ctx.userId is following
      // Filter based on user? Not sure yet

      return true;
    },
  })
  followingPostsSub(
    @Root() feedPayload: HandlePostPayload,
    @Ctx() ctx: MyContext
    // @Arg("data", () => PostSubscriptionInput)
    // input: PostSubscriptionInput
  ): HandlePostPayload {
    // opportunity to transform data (the filter above has to be boolean)

    feedPayload.isCtxUserIdAFollowerOfPostUser &&
      feedPayload.user.id === ctx.userId;

    return feedPayload; // createdAt: new Date()
  }

  @Query(() => [FollowingPostReturnType], {
    name: "myFollowingPosts",
    nullable: true,
  })
  async myFollowingPosts(
    // @Arg("data") { me }: MyImagesInput,
    @Ctx() ctx: MyContext
  ): Promise<FollowingPostReturnType[]> {
    const userId = ctx.userId;
    //  ctx.req.session ? ctx.req.session.userId : null;

    // search for the logged in user
    // get posts of those the user follows
    let thoseIFollowAndTheirPosts = await User.findOne({
      where: { id: userId },
      relations: [
        "following",
        "followers",
        "following.posts",
        "following.posts.images",
        "following.posts.user",
        "following.posts.comments",
        "following.posts.likes",
        "following.posts.likes.user",
      ],
    });

    const justThePosts = thoseIFollowAndTheirPosts!.following.map((person) =>
      person.posts!.map((post) => post)
    );

    let cache: any[] = [];

    let currentlyLiked;

    justThePosts.forEach((postArr) =>
      cache.push(
        ...postArr.map((singlePost: Post) => {
          currentlyLiked =
            singlePost && singlePost.likes.length >= 1
              ? singlePost.likes.filter((likeRecord) => {
                  return likeRecord.user.id === ctx.userId;
                }).length > 0
              : false;

          return {
            ...singlePost,
            comments_count: singlePost.comments.length,
            likes_count: singlePost.likes.length,
            currently_liked: currentlyLiked,
          };
        })
      )
    );

    cache.sort(function(a, b) {
      // Turn strings into dates, and then subtract them
      // to get a value that is either negative, positive, or zero.
      return b.created_at.getTime() - a.created_at.getTime();
    });

    if (cache) {
      return cache;
    } else {
      return [];
    }
  }
}
