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
    console.log("INSIDE CREATE POST RESOLVER");
    let newImage = new Image();

    let user = await User.findOne(data.user);
    console.log("user".toUpperCase());
    console.log(user);

    newImage.uri = data.images[0];
    newImage.user = user ? user : data.user;

    let newPost = new Post();

    newPost.text = data.text;
    newPost.title = data.title;

    newPost.user = user!;

    console.log("view new post");
    console.log(newPost);
    newPost.images = [newImage];
    console.log("view new post again");
    console.log(newPost);

    // this double save is garbage
    // may have to turn on cascades
    newPost.save();
    newImage.post = newPost;
    newImage.save();
    // @ts-ignore
    user!.posts = [newPost];
    user!.save();

    return newPost.save();
  }
}
