import { Resolver, Query, UseMiddleware, Ctx } from "type-graphql";

import { isAuth } from "../middleware/isAuth";
import { logger } from "../middleware/logger";
import { MyContext } from "../../types/MyContext";
import { Post } from "../../entity/Post";

@Resolver()
export class GetGobalPostsResolver {
  @UseMiddleware(isAuth, logger)
  @Query(() => [Post], {
    name: "getGobalPosts",
    nullable: true
  })
  async getGobalPosts(@Ctx() ctx: MyContext): Promise<any> {
    const userId = ctx.req.session ? ctx.req.session.userId : null;
    console.log("USERID", userId);

    const findOptions = {
      where: {},
      relations: ["images", "user"]
    };

    let globalPosts = await Post.find(findOptions);

    console.log("globalPosts", globalPosts);

    if (globalPosts) {
      return globalPosts;
    } else {
      throw Error(
        "cannot find those you are following (along with their posts)"
      );
    }
  }
}
