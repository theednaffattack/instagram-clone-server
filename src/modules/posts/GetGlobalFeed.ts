import {
  Resolver,
  Query,
  UseMiddleware,
  Subscription,
  ResolverFilterData,
  Root,
  Ctx,
  PubSub,
  Publisher
} from "type-graphql";

import { isAuth } from "../middleware/isAuth";
import { logger } from "../middleware/logger";
import { Post } from "../../entity/Post";
import { PostInput } from "./createPost/CreatePostInput";
import { MyContext } from "../../types/MyContext";
// import { HandlePostPayload } from "./GetMyPosts";

@Resolver()
export class GetGlobalPostsResolver {
  // @ts-ignore
  @Subscription(type => Post, {
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
    filter: ({ payload, context }: ResolverFilterData<Post, PostInput>) => {
      // * Always return a boolean or Promise<boolean> here
      // in future we'd probably sort
      // for regionality or something
      // business-y.
      return true;
    }
  })
  // this is the actual class method that activates?
  // the subscribe. I'm not really sure how this part
  // works besides accessing the root query to add a
  // resolver method. For now I don't transform
  // anything here
  globalPosts(@Root() postPayload: Post) {
    return { ...postPayload };
  }

  @UseMiddleware(isAuth, logger)
  @Query(() => [Post], {
    name: "getGlobalPosts",
    nullable: true
  })
  async getGlobalPosts(
    @Ctx() ctx: MyContext,

    @PubSub("GLOBAL_POSTS") publish: Publisher<any>
    // @PubSub("POSTS_GLOBAL") publishGlbl: Publisher<PostPayload>,
  ): Promise<any> {
    const findOptions = {
      where: {},
      relations: ["images", "user", "user.followers"]
    };

    let globalPosts = await Post.find(findOptions);

    let addFollowerStatusToGlobalPosts = globalPosts.map(post => {
      return {
        isCtxUserIdAFollowerOfPostUser: post.user.followers
          .map(follower => follower.id)
          .includes(ctx.userId),
        ...post,
        success: true,
        action: "CREATE"
      };
    });

    if (addFollowerStatusToGlobalPosts) {
      await publish(addFollowerStatusToGlobalPosts).catch((error: Error) => {
        throw new Error(error.message);
      });

      return addFollowerStatusToGlobalPosts;
    } else {
      throw Error("cannot find global posts");
    }
  }
}
