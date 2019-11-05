import { Resolver, Query, UseMiddleware, Arg } from "type-graphql";
import { FindOneOptions } from "typeorm";

import { isAuth } from "../middleware/isAuth";
import { logger } from "../middleware/logger";
import { Post } from "../../entity/Post";
import { GetMyFollowingPostByIdInput } from "./GetMyFollowingPostByIdInput";
// import { MyContext } from "../../types/MyContext";
// import { User } from "../../entity/User";

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
    // const isMeAFollower = await User.createQueryBuilder("user")
    //   .where({ id: getpostinput.postId })
    //   .leftJoinAndSelect("user.followers", "follower", "follower.id = :id", {
    //     id: ctx.userId
    //   })
    //   .getOne();

    let findOnePostOptions: FindOneOptions<Post> = {
      where: { id: getpostinput.postId },
      relations: ["images", "user"]
    };

    const singlePostOfSomeoneIFollow = await Post.findOne(findOnePostOptions);

    // console.log(isMeAFollower);
    // console.log(singlePostOfSomeoneIFollow);
    if (singlePostOfSomeoneIFollow) {
      return singlePostOfSomeoneIFollow;
    } else {
      return null;
    }
  }
}
