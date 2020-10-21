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
  Ctx,
  ObjectType,
  ID,
} from "type-graphql";

import { PostInput } from "./createPost/CreatePostInput";
import { logger } from "../middleware/logger";
import { isAuth } from "../middleware/isAuth";
import { Image } from "../../entity/Image";
import { User } from "../../entity/User";
import { Post } from "../../entity/Post";
import { MyContext } from "../../types/MyContext";

/**
 * Post type for returns to client
 */
@ObjectType()
export class PostSubType {
  // @ts-ignore
  @Field((type) => ID)
  id: string;

  // @ts-ignore
  @Field((type) => String)
  title: string;

  // @ts-ignore
  @Field((type) => String)
  text: string;

  // @ts-ignore
  @Field((type) => [Image])
  images: Image[];

  // @ts-ignore
  @Field((type) => User)
  user?: User;

  // @ts-ignore
  @Field((type) => Date)
  created_at: Date;

  // @ts-ignore
  @Field((type) => Date)
  updated_at?: Date;
}

export interface PostPayload {
  id: string;
  title: string;
  text: string;
  images: Image[];
  user: User;

  likes_count?: number;
  comments_count?: number;
  currently_liked?: boolean;
  isCtxUserIdAFollowerOfPostUser?: boolean;
}

@InputType()
export class PostSubInput {
  // @ts-ignore
  @Field((type) => String)
  sentBy: string;
  // @ts-ignore
  @Field((type) => String)
  message: string;
}

@Resolver()
export class CreatePost {
  // @ts-ignore
  @Subscription((type) => PostSubType, {
    topics: ({ context }) => {
      if (!context.userId) {
        throw new Error("Not authorized");
      }

      return "POSTS_FOLLOWERS";
    },

    // @ts-ignore
    filter: ({
      payload,
      // args,
      context,
    }: ResolverFilterData<Post, PostInput, MyContext>) => {
      if (!payload) return false;
      // filter for followers;
      if (
        payload.user.followers.map((user) => user.id).includes(context.userId)
      ) {
        return true;
      } else {
        return false;
      }
    },
    // filter: ({ payload, args }) => args.priorities.includes(payload.priority),
  })
  followingPosts(
    @Root() postPayload: PostPayload,
    // @ts-ignore
    @Arg("data") input: PostSubInput
  ): PostPayload {
    // do some stuff
    console.log("VIEW INPUT (likesUpdated subscriber func)", input);
    console.log(
      "VIEW LIKES PAYLOAD (likesUpdated subscriber func)",
      postPayload
    );
    return { ...postPayload };
  }

  @UseMiddleware(isAuth, logger)
  @Mutation(() => Post, { name: `createPost` })
  async createPost(
    @Ctx() context: MyContext,

    @PubSub("POSTS_FOLLOWERS") publish: Publisher<PostPayload>,
    @PubSub("POSTS_GLOBAL") publishGlbl: Publisher<PostPayload>,
    @Arg("data", () => PostInput)
    { text, title, images }: PostInput
  ): Promise<PostSubType> {
    // The commented code below should be useless...
    // if (!context) {
    //   throw new Error("not authenticated");
    // }

    let user = await User.findOne(context.userId, {
      relations: ["images", "posts", "followers"],
    });

    if (user) {
      const newImageData: Image[] = images.map((image) =>
        Image.create({
          uri: `${image}`,
          user: user,
        })
      );

      // save that image to the database
      let newImages = await Promise.all(
        newImageData.map(async (newImage) => await newImage.save())
      );

      // add the images to the user.images
      // field / column
      if (newImages !== null && newImages.length > 0) {
        user.images = [...user.images, ...newImages];
      }

      // save the user completing the many-to-one images-to-user
      // relation loop
      let savedUser = await user.save().catch((error) => {
        new Error(
          `Error updating user images\n${JSON.stringify(error, null, 2)}`
        );
        return null;
      });

      // both must be true to create a post, always
      if (newImages && savedUser) {
        const postData = {
          text,
          title,
          user,
          images: [...newImages],
        };
        let newPost = await Post.create(postData).save();

        newImages.forEach(async (newSavedImage) => {
          newSavedImage.post = newPost;
          await newSavedImage.save();
        });

        user && user.posts && user.posts.push(newPost);
        // user!.posts!.push(newPost);
        await user.save();

        // we use myPostPayload because of the subscription
        let myPostPayload: PostPayload = {
          ...newPost,
          likes_count: 0,
          comments_count: 0,
          currently_liked: false,
          isCtxUserIdAFollowerOfPostUser: newPost.user.followers
            .map((follower) => follower.id)
            .includes(user.id),
        };

        await publish(myPostPayload);
        await publishGlbl(myPostPayload);
        // return true;
        return newPost;
      }
    }
    throw Error("the logged in user could not be found in the database");
  }
}
