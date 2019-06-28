import { Resolver, Query, UseMiddleware, Ctx } from "type-graphql";

import { isAuth } from "../middleware/isAuth";
import { logger } from "../middleware/logger";
import { MyContext } from "../../types/MyContext";
import { User } from "../../entity/User";

@Resolver()
export class GetThoseIFollowAndTheirPostsResolver {
  @UseMiddleware(isAuth, logger)
  @Query(() => User, {
    name: "getThoseIFollowAndTheirPostsResolver",
    nullable: true
  })
  async getThoseIFollowAndTheirPostsResolver(
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
        "following.posts.images"
      ]
    });

    if (thoseIFollowAndTheirPosts) {
      return thoseIFollowAndTheirPosts;
    } else {
      return [];
    }
  }
}
