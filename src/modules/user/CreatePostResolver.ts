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
    user: userId,
    picture
  }: PostInput) {
    let user = await User.findOne(userId, {
      relations: ["images", "posts"]
    });
    if (user) {
      // @ts-ignore
      const { filename, createReadStream } = await picture;

      const lastImage = images.length > 1 ? images.length - 1 : 0;
      console.log("IS THIS THE ERROR?");
      console.log(images[lastImage]);

      let imageUrl = `/../../../public/tmp/images/${images[lastImage]}`;

      let savedFile = await new Promise((resolve, reject) => {
        createReadStream()
          .pipe(createWriteStream(__dirname + imageUrl))
          .on("finish", () => {
            resolve(true);
          })
          .on("error", () => {
            reject(false);
          });
      });
      console.log("FILE SAVED? ", savedFile);

      // add new image

      // let newImage = new Image();

      const newImage = await Image.create({
        uri: images[lastImage],
        user: user
      });

      // newImage.uri = images[lastImage];
      // newImage.user = await Promise.resolve(user);
      await newImage.save();

      console.log("newImage".toUpperCase());
      console.log(newImage);

      // save the images to the user.images
      // field / column
      user.images.push(newImage);
      await user.save();
      console.log("user save".toUpperCase());

      // create a new post
      // newPost.text = text;
      // newPost.title = title ? title : "";
      // newPost.user = user;
      // newPost.images.push(newImage);

      // associate the post w/ the image

      // associate the user w/ the posts
      // because user posts is pre-existing
      // I can't risk replacing previous posts
      const postData = {
        text,
        title,
        user,
        images: [newImage]
      };
      console.log("can i see post data".toUpperCase());
      console.log(postData);

      let newPost = await Post.create(postData);
      console.log("NEW POST", newPost);

      await newPost.save();
      console.log("NEW POST", newPost);
      newImage.post = newPost;
      await newImage.save();

      user!.posts!.push(newPost);
      user.save();
      return await newPost;
    }
    throw Error("the logged in user could not be found in the database");
  }
}
