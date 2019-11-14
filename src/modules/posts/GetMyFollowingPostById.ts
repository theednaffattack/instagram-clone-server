import { Resolver, Query, UseMiddleware, Arg } from "type-graphql";

import { isAuth } from "../middleware/isAuth";
import { logger } from "../middleware/logger";
import { Post } from "../../entity/Post";
import { GetMyFollowingPostByIdInput } from "./GetMyFollowingPostByIdInput";

@Resolver()
export class GetMyFollowingPostById {
  @UseMiddleware(isAuth, logger)
  @Query(() => Post, {
    name: "getMyFollowingPostById",
    nullable: true
  })
  async getMyFollowingPostById(
    @Arg("getpostinput", () => GetMyFollowingPostByIdInput)
    getpostinput: GetMyFollowingPostByIdInput
    // @Ctx() ctx: MyContext
  ): Promise<any> {
    let singlePostOfSomeoneIFollow = await Post.createQueryBuilder("post")
      .leftJoinAndSelect("post.comments", "comments")
      .leftJoinAndSelect("post.user", "user")
      .leftJoinAndSelect("post.likes", "likes")
      .where({ id: getpostinput.postId })
      .orderBy("comments.created_at", "ASC")
      .getOne();

    if (singlePostOfSomeoneIFollow) {
      singlePostOfSomeoneIFollow.likes_count =
        singlePostOfSomeoneIFollow.likes.length;

      singlePostOfSomeoneIFollow.comments_count =
        singlePostOfSomeoneIFollow.comments.length;
    }

    if (singlePostOfSomeoneIFollow) {
      return singlePostOfSomeoneIFollow;
    } else {
      return null;
    }
  }
}
