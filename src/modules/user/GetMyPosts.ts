import { Resolver, Query, UseMiddleware, Ctx } from "type-graphql";

import { isAuth } from "../middleware/isAuth";
import { logger } from "../middleware/logger";
import { MyContext } from "../../types/MyContext";
import { User } from "../../entity/User";
import { Post } from "../../entity/Post";

@Resolver()
export class MyFollowingPostsResolver {
  @UseMiddleware(isAuth, logger)
  @Query(() => [Post], {
    name: "myFollowingPosts",
    nullable: true
  })
  async myFollowingPosts(
    // @Arg("data") { me }: MyImagesInput,
    @Ctx() ctx: MyContext
  ): Promise<any> {
    const userId = ctx.req.session ? ctx.req.session.userId : null;

    let thoseIFollowAndTheirPosts = await User.findOne({
      where: { id: userId },
      relations: [
        "following",
        "followers",
        "following.posts",
        "following.posts.images",
        "following.posts.user"
      ]
    });

    const justThePosts = thoseIFollowAndTheirPosts!.following.map(person =>
      person.posts!.map(post => post)
    );

    let cache: Post[] = [];

    justThePosts.forEach(postArr => cache.push(...postArr));

    cache.sort(function(a, b) {
      // Turn your strings into dates, and then subtract them
      // to get a value that is either negative, positive, or zero.
      return b.created_at.getTime() - a.created_at.getTime();
    });

    console.log("what is cache again?".toUpperCase(), cache);

    if (cache) {
      return cache;
    } else {
      return [];
    }
  }
}
