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

    // retrieve post, check if a record exists then determine if it's been
    // liked by the user
    // if the Post record doesn't exist the variable is false
    // if the record does exist but the logged in user is not among the likes...
    // the variable is false. If the user HAS liked the Post the variable is true
    let currentlyLiked =
      singlePostOfSomeoneIFollow && singlePostOfSomeoneIFollow.likes.length >= 1
        ? singlePostOfSomeoneIFollow.likes.filter(likeRecord => {
            return likeRecord.user.id === ctx.userId;
          }).length > 0
        : false;

    let returnData;

    if (singlePostOfSomeoneIFollow) {
      returnData = {
        ...singlePostOfSomeoneIFollow,
        likes_count: singlePostOfSomeoneIFollow.likes.length,
        comments_count: singlePostOfSomeoneIFollow.comments.length,
        currently_liked: currentlyLiked
      };
    }

    if (returnData) {
      return returnData;
    } else {
      return null;
    }
  }
}
