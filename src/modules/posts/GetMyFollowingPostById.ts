import { Resolver, Query, UseMiddleware, Arg, Ctx } from "type-graphql";

import { isAuth } from "../middleware/isAuth";
import { logger } from "../middleware/logger";
import { GetMyFollowingPostByIdInput } from "./GetMyFollowingPostByIdInput";
import { MyContext } from "../../types/MyContext";
import { FollowingPostReturnType } from "../../types/PostReturnTypes";
import { Post } from "../../entity/Post";

@Resolver()
export class GetMyFollowingPostById {
  @UseMiddleware(isAuth, logger)
  @Query(() => FollowingPostReturnType, {
    name: "getMyFollowingPostById",
    nullable: true
  })
  async getMyFollowingPostById(
    @Arg("getpostinput", () => GetMyFollowingPostByIdInput)
    getpostinput: GetMyFollowingPostByIdInput,
    @Ctx() ctx: MyContext
  ): Promise<FollowingPostReturnType | null> {
    let singlePostOfSomeoneIFollow = await Post.createQueryBuilder("post")
      .leftJoinAndSelect("post.comments", "comments")
      .leftJoinAndSelect("post.user", "user")
      .leftJoinAndSelect("post.likes", "likes")
      .leftJoinAndSelect("likes.user", "l_user")
      .where({ id: getpostinput.postId })
      .orderBy("comments.created_at", "ASC")
      .getOne();

    let alreadyLiked =
      singlePostOfSomeoneIFollow && singlePostOfSomeoneIFollow.likes.length >= 1
        ? !!singlePostOfSomeoneIFollow.likes.filter(likeRecord => {
            return likeRecord.user.id === ctx.userId;
          })
        : false;

    let returnData;

    if (singlePostOfSomeoneIFollow) {
      returnData = {
        ...singlePostOfSomeoneIFollow,
        likes_count: singlePostOfSomeoneIFollow.likes.length,
        comments_count: singlePostOfSomeoneIFollow.comments.length,
        already_liked: alreadyLiked
      };
    }

    if (returnData) {
      return returnData;
    } else {
      return null;
    }
  }
}
