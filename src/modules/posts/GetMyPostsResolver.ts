import { createWriteStream } from "fs";
// import { createBaseResolver } from "../type-graphql/CreateBaseResolver";
import { PostInput } from "./createPost/CreatePostInput";
import { Arg, Mutation, Resolver, UseMiddleware } from "type-graphql";

import { logger } from "../middleware/logger";
import { isAuth } from "../middleware/isAuth";
import { Image } from "../../entity/Image";
import { User } from "../../entity/User";
import { Post } from "../../entity/Post";

@Resolver()
export class CreatePostResolver {
  @UseMiddleware(isAuth, logger)
  @Mutation(() => Post, { name: `createPost` })
  async create(@Arg("data", () => PostInput)
  {
    text,
    title,
    images,
    user: userId
  }: PostInput) {
    let user = await User.findOne(userId, {
      relations: ["images", "posts"]
    });

    if (user) {
      // @ts-ignore
      const { filename, createReadStream } = await picture;

      const lastImage = images.length > 1 ? images.length - 1 : 0;

      let imageUrl = `/../../../public/tmp/images/${images[lastImage]}`;

      await new Promise((resolve, reject) => {
        createReadStream()
          .pipe(createWriteStream(__dirname + imageUrl))
          .on("finish", () => {
            resolve(true);
          })
          .on("error", () => {
            reject(false);
          });
      });

      // add new image

      // let newImage = new Image();

      const newImage = await Image.create({
        uri: images[lastImage],
        user: user
      });

      // newImage.uri = images[lastImage];
      // newImage.user = await Promise.resolve(user);
      await newImage.save();

      // save the images to the user.images
      // field / column
      user.images.push(newImage);
      await user.save();

      const postData = {
        text,
        title,
        user,
        images: [newImage]
      };

      let newPost = await Post.create(postData);

      await newPost.save();

      newImage.post = newPost;
      await newImage.save();

      user!.posts!.push(newPost);
      user.save();
      return await newPost;
    }
    throw Error("the logged in user could not be found in the database");
  }
}
