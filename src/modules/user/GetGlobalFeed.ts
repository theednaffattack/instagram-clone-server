import { Resolver, Query, UseMiddleware } from "type-graphql";

import { isAuth } from "../middleware/isAuth";
import { logger } from "../middleware/logger";
import { Post } from "../../entity/Post";

@Resolver()
export class GetGobalPostsResolver {
  @UseMiddleware(isAuth, logger)
  @Query(() => [Post], {
    name: "getGobalPosts",
    nullable: true
  })
  async getGobalPosts(): Promise<any> {
    const findOptions = {
      where: {},
      relations: ["images", "user"]
    };

    let globalPosts = await Post.find(findOptions);

    if (globalPosts) {
      return globalPosts;
    } else {
      throw Error(
        "cannot find those you are following (along with their posts)"
      );
    }
  }
}
