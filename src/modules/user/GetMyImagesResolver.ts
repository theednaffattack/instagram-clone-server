import { Resolver, Query, UseMiddleware, Ctx } from "type-graphql";

import { isAuth } from "../middleware/isAuth";
import { logger } from "../middleware/logger";
import { Image } from "../../entity/Image";
import { MyContext } from "../../types/MyContext";

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
