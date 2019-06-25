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
    console.log("USERID", userId);
    let thoseIFollowAndTheirPosts = await User.findOne({
      where: { id: userId },
      relations: [
        "am_follower",
        "am_follower.posts",
        "am_follower.posts.images"
      ]
    });

    if (thoseIFollowAndTheirPosts) {
      return thoseIFollowAndTheirPosts;
    } else {
      throw Error(
        "cannot find those you are following (along with their posts)"
      );
    }
  }
}
