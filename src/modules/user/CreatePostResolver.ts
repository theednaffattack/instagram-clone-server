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
  async create(@Arg("data", () => PostInput) data: any) {
    let newImage = new Image();
    let newPost = new Post();
    let user = await User.findOne(data.user, {
      relations: ["images", "posts"]
    });
    if (user) {
      // add new image
      newImage.uri = data.images[0];
      newImage.user = data.user;
      await newImage.save();

      // save the images to the user.images
      // field / column
      user.images = [newImage];
      await user!.save();

      // create a new post
      newPost.text = data.text;
      newPost.title = data.title;
      newPost.user = user!;
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
