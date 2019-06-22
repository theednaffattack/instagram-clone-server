import { createWriteStream } from "fs";
// import { createBaseResolver } from "../type-graphql/CreateBaseResolver";
import { Post } from "../../entity/Post";
import { PostInput } from "./createPost/CreatePostInput";
import { Arg, Mutation, Resolver, UseMiddleware } from "type-graphql";

import { logger } from "../middleware/logger";
import { isAuth } from "../middleware/isAuth";
import { Image } from "../../entity/Image";
import { User } from "../../entity/User";

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
    let newImage = new Image();
    let newPost = new Post();
    let user = await User.findOne(userId, {
      relations: ["images", "posts"]
    });
    if (user) {
      const { filename, createReadStream } = await picture;

      let imageUrl = `/../../../public/tmp/images/${filename}`;

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
      newImage.uri = images[0];
      console.log("IS THIS THE ERROR?");
      console.log(images[0]);
      newImage.user = user;
      await newImage.save();

      // save the images to the user.images
      // field / column
      user.images = [newImage];
      await user!.save();

      // create a new post
      newPost.text = text;
      newPost.title = title ? title : "";
      newPost.user = user;
      newPost.images = [newImage];

      // associate the post w/ the image
      newImage.post = newPost;

      // associate the user w/ the posts
      // because user posts is pre-existing
      // I can't risk replacing previous posts
      user.posts =
        user.posts && Array.isArray(user.posts)
          ? [...user.posts, newPost]
          : [newPost];

      return await newPost.save();
    }
    throw Error("the logged in user could not be found in the database");
  }
}
