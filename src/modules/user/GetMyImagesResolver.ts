import { Resolver, Query, UseMiddleware, Ctx } from "type-graphql";

import { isAuth } from "../middleware/isAuth";
import { logger } from "../middleware/logger";
import { Image } from "../../entity/Image";
import { MyContext } from "../../types/MyContext";
import { User } from "../../entity/User";
// import { Follower } from "../../entity/Follower";
// import { Follower } from "src/entity/Follower";

@Resolver()
export class GetAllMyImagesResolver {
  @UseMiddleware(isAuth, logger)
  @Query(() => [Image], { name: "GetAllMyImages", nullable: false })
  async getAllMyImages(
    // @Arg("data") { me }: MyImagesInput,
    @Ctx() ctx: MyContext
  ): Promise<any> {
    const userId = ctx.req.session ? ctx.req.session.userId : null;

    let images = await Image.find({
      where: { user: userId },
      relations: ["post"]
    });

    if (images) {
      return images;
    } else {
      throw Error("cannot find image");
    }
  }
}

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
        // "followed_by",

        // "am_follower.images",
        "am_follower.posts",
        // "followed_by.images",

        "am_follower.posts.images"

        // "am_follower.images.post"
        // "followed_by.images.post",
      ]
    });

    // console.log(`qbldrMyFllowerAndTheirPosts`, qbldrMyFllowerAndTheirPosts);
    console.log("myFollowersAndTheirPosts".toUpperCase());
    console.log(JSON.stringify(thoseIFollowAndTheirPosts, null, 2));

    if (thoseIFollowAndTheirPosts) {
      return thoseIFollowAndTheirPosts;
    } else {
      throw Error(
        "cannot find those you are following (along with their posts)"
      );
    }
  }
}