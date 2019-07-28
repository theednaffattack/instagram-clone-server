import { createWriteStream } from "fs";
import {
  Arg,
  Field,
  InputType,
  Mutation,
  Publisher,
  PubSub,
  Resolver,
  ResolverFilterData,
  Root,
  Subscription,
  UseMiddleware,
  Ctx
} from "type-graphql";

import { PostInputOld } from "./createPost/CreatePostInput";
import { logger } from "../middleware/logger";
import { isAuth } from "../middleware/isAuth";
import { Image } from "../../entity/Image";
import { User } from "../../entity/User";
import { Post, PostSubType } from "../../entity/Post";
import { MyContext } from "../../types/MyContext";

export interface PostPayload {
  id: string;
  title: string;
  text: string;
  images: Image[];
  user: User;
}

@InputType()
export class QuickPostSubsInput {
  // @ts-ignore
  @Field(type => String)
  sentBy: string;
  // @ts-ignore
  @Field(type => String)
  message: string;
}

@Resolver()
export class CreatePostResolver {
  // @ts-ignore
  @Subscription(type => PostSubType, {
    topics: ({ context }) => {
      if (!context.userId) {
        throw new Error("not authed");
      }

      return "POSTS_FOLLOWERS";
    },

    // @ts-ignore
    filter: ({
      payload,
      // args,
      context
    }: ResolverFilterData<Post, PostInputOld>) => {
      // filter for followers;
      // @ts-ignore
      if (context.userId !== payload.user.followers.includes(context.id)) {
        return true;
      } else {
        return false;
      }
    }
    // filter: ({ payload, args }) => args.priorities.includes(payload.priority),
  })
  followingPosts(
    @Root() postPayload: PostPayload,
    // @ts-ignore
    @Arg("data") input: QuickPostSubsInput
  ): PostPayload {
    // do some stuff
    return { ...postPayload };
    // createdAt: new Date()
  }

  @UseMiddleware(isAuth, logger)
  @Mutation(() => Post, { name: `createPost` })
  async createPost(
    @Ctx() context: MyContext,

    // @ts-ignore
    @PubSub("POSTS_FOLLOWERS") publish: Publisher<PostPayload>,
    @PubSub("POSTS_GLOBAL") publishGlbl: Publisher<PostPayload>,
    @Arg("data", () => PostInputOld)
    { text, title, images, user: userId }: PostInputOld
  ) {
    if (!context) {
      throw new Error("not authed");
    }

    let user = await User.findOne(userId, {
      relations: ["images", "posts", "followers"]
    });
    if (user) {
      // @ts-ignore
      const { filename, createReadStream } = await picture;

      const lastImage = images.length > 1 ? images.length - 1 : 0;

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

      // add new image

      // let newImage = new Image();

      const tmpImageData = await Image.create({
        uri: images[lastImage],
        user: user
      });

      let newImage = await tmpImageData.save();

      // save the images to the user.images
      // field / column
      user.images.push(newImage);

      let savedUser = await user.save();

      if (savedFile && newImage && savedUser) {
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

        // we use myPostPayload because of the subscription
        let myPostPayload: PostPayload = { ...newPost };

        await publish(myPostPayload);
        await publishGlbl(myPostPayload);
        // return true;
        return newPost;
      }
    }
    throw Error("the logged in user could not be found in the database");
  }
}
