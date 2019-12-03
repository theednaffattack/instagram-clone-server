import { Resolver, Query, UseMiddleware, Arg, Ctx } from "type-graphql";

import { isAuth } from "../middleware/isAuth";
import { logger } from "../middleware/logger";
import { GetGlobalPostByIdInput } from "./GetGlobalPostByIdInput";
import { MyContext } from "../../types/MyContext";
import { GlobalPostReturnType } from "../../types/PostReturnTypes";
import { Post } from "../../entity/Post";

@Resolver()
export class GetGlobalPostById {
  @UseMiddleware(isAuth, logger)
  @Query(() => GlobalPostReturnType, {
    name: "getGlobalPostById",
    nullable: true
  })
  async getGlobalPostById(
    @Arg("getpostinput", () => GetGlobalPostByIdInput)
    getpostinput: GetGlobalPostByIdInput,
    @Ctx() ctx: MyContext
  ): Promise<GlobalPostReturnType | null> {
    let singleGlobalPost = await Post.createQueryBuilder("post")
      .leftJoinAndSelect("post.images", "images")
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
      singleGlobalPost && singleGlobalPost.likes.length >= 1
        ? singleGlobalPost.likes.filter(likeRecord => {
            return likeRecord.user.id === ctx.userId;
          }).length > 0
        : false;

    let returnData;

    if (singleGlobalPost) {
      returnData = {
        ...singleGlobalPost,
        likes_count: singleGlobalPost.likes.length,
        comments_count: singleGlobalPost.comments.length,
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
