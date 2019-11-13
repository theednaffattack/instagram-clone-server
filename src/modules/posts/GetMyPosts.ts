import {
  Resolver,
  Query,
  UseMiddleware,
  Ctx,
  Field,
  ID,
  ObjectType,
  Subscription,
  ResolverFilterData,
  InputType,
  Root,
  Int
  // registerEnumType
} from "type-graphql";
import util from "util";

import { isAuth } from "../middleware/isAuth";
import { logger } from "../middleware/logger";
import { MyContext } from "../../types/MyContext";
import { User } from "../../entity/User";
import { Post } from "../../entity/Post";
import { Image } from "../../entity/Image";

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

@ObjectType()
export class HandlePostPayload {
  @Field(() => Boolean)
  success: boolean;

  @Field(() => String)
  action: string;

  @Field(() => ID, { nullable: true })
  id: string;

  @Field(() => Boolean, { nullable: true })
  title: string;

  @Field(() => [Image], { nullable: true })
  images: Image[];

  @Field(() => Boolean, { nullable: true })
  isCtxUserIdAFollowerOfPostUser?: boolean;

  @Field(() => User, { nullable: true })
  user: User;

  @Field(() => Date, { nullable: true })
  created_at: Date;

  @Field(() => Date, { nullable: true })
  updated_at?: Date;

  @Field(() => Int, { nullable: true })
  comment_count?: number;
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
      args
    }: ResolverFilterData<HandlePostPayload, PostSubscriptionInput>) => {
      console.log("posts subscription".toUpperCase());
      // filter for those ctx.userId is following
      // Filter based on user? Not sure yet

      return true;
    }
  })
  followingPostsSub(
    @Root() feedPayload: HandlePostPayload,
    @Ctx() ctx: MyContext
    // @Arg("data", () => PostSubscriptionInput)
    // input: PostSubscriptionInput
  ): HandlePostPayload {
    // opportunity to transform data (the filter above has to be boolean)
    console.log("VIEW THE PAYLOAD", util.inspect(feedPayload, true, 3, true));
    feedPayload.isCtxUserIdAFollowerOfPostUser &&
      feedPayload.user.id === ctx.userId;

    return feedPayload; // createdAt: new Date()
  }

  @Query(() => [Post], {
    name: "myFollowingPosts",
    nullable: true
  })
  async myFollowingPosts(
    // @Arg("data") { me }: MyImagesInput,
    @Ctx() ctx: MyContext
  ): Promise<any> {
    const userId = ctx.req.session ? ctx.req.session.userId : null;

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
        "following.posts.likes"
      ]
    });

    const justThePosts = thoseIFollowAndTheirPosts!.following.map(person =>
      person.posts!.map(post => post)
    );

    let cache: any[] = [];

    justThePosts.forEach(postArr =>
      cache.push(
        ...postArr.map((singlePost: Post) => {
          return {
            ...singlePost,
            comments_count: singlePost.comments.length,
            likes_count: singlePost.likes.length
          };
        })
      )
    );

    cache.sort(function(a, b) {
      console.log("WHAT DOES THE TIMESTRING LOOK LIKE?\n", { a, b });
      // Turn your strings into dates, and then subtract them
      // to get a value that is either negative, positive, or zero.
      return b.created_at.getTime() - a.created_at.getTime();
    });

    console.log("WHAT DO THE POSTS LOOK LIKE?\n", { cache });

    // let sortAndAddCounts = justThePosts[0]
    //   .sort(function(a, b) {
    //     // Turn your strings into dates, and then subtract them
    //     // to get a value that is either negative, positive, or zero.
    //     return b.created_at.getTime() - a.created_at.getTime();
    //   })
    //   .map(post => {
    //     return {
    //       ...post,
    //       comments_count: post.comments.length,
    //       likes_count: post.likes.length
    //     };
    //   });

    if (cache) {
      return cache;
    } else {
      return [];
    }
  }
}
