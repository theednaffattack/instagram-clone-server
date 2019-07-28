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

import { PostInput } from "./createPost/CreatePostInput";
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
export class PostSubInput {
  // @ts-ignore
  @Field(type => String)
  sentBy: string;
  // @ts-ignore
  @Field(type => String)
  message: string;
}

@Resolver()
export class CreatePost {
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
    }: ResolverFilterData<Post, PostInput>) => {
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
    @Arg("data") input: PostSubInput
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
    @Arg("data", () => PostInput)
    { text, title, images, user: userId }: PostInput
  ) {
    if (!context) {
      throw new Error("not authed");
    }

    let user = await User.findOne(userId, {
      relations: ["images", "posts", "followers"]
    });

    if (user) {
      const cdnImageUrl = `https://eddie-faux-gram.s3.amazonaws.com`;

      const lastImage = images.length > 1 ? images.length - 1 : 0;

      // let imageUrl = `/../../../public/tmp/images/${images[lastImage]}`;

      // let savedFile = await new Promise((resolve, reject) => {
      //   createReadStream()
      //     .pipe(createWriteStream(__dirname + imageUrl))
      //     .on("finish", () => {
      //       resolve(true);
      //     })
      //     .on("error", () => {
      //       reject(false);
      //     });
      // });

      // add new image

      // let newImage = new Image();
      console.log("Let's see the images submitted", images);
      // use the model to create a new image
      const newImageData = Image.create({
        uri: `${cdnImageUrl}/${images[lastImage]}`,
        user: user
      });

      // save that image to the database
      let newImage = await newImageData.save().catch(error => {
        new Error(`Error saving images\n${JSON.stringify(error, null, 2)}`);
        return null;
      });

      // add the images to the user.images
      // field / column
      if (newImage) {
        user.images.push(newImage);
      }

      // save the user completing the many-to-one images-to-user
      // relation loop
      let savedUser = await user.save().catch(error => {
        new Error(
          `Error updating user images\n${JSON.stringify(error, null, 2)}`
        );
        return null;
      });

      // both must be true to create a post, always
      if (newImage && savedUser) {
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
