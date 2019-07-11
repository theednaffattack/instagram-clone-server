import {
  Arg,
  Args,
  Resolver,
  Ctx,
  Mutation,
  Field,
  ObjectType,
  ResolverFilterData,
  Root,
  PubSub,
  Subscription,
  ID
} from "type-graphql";

import {
  AddMessageToThreadInput,
  AddMessageToThreadInput_v2
} from "./MessageThreadInput";
import { MyContext } from "../../types/MyContext";
import { Thread } from "../../entity/Thread";
import { Message } from "../../entity/Message";
import { User } from "../../entity/User";
import { Image } from "../../entity/Image";
import { createWriteStream } from "fs";

export interface IAddMessagePayload {
  success: boolean;
  threadId: string;
  message: Message;
  user: User;
}

@ObjectType()
export class AddMessagePayload {
  @Field(() => Boolean)
  success: boolean;

  @Field(() => ID)
  threadId: string;

  @Field(() => Message)
  message: Message;

  @Field(() => User)
  user: User;

  // @Field(() => [Image], { nullable: "itemsAndList" })
  // images?: Image[];
}

@Resolver()
export class AddMessageToThreadResolver {
  // @ts-ignore
  @Subscription(type => AddMessagePayload, {
    // @ts-ignore
    topics: ({ context }: any) => {
      if (!context.userId) {
        throw new Error("not authorized for this topic");
      }

      return "THREADS";
    },

    // @ts-ignore
    filter: ({
      payload,
      args,
      // @ts-ignore
      context
    }: ResolverFilterData<IAddMessagePayload, AddMessageToThreadInput>) => {
      // filter for followers;

      // @ts-ignore
      const messageMatchesThread = args.data.threadId === payload.threadId;

      if (messageMatchesThread) {
        return true;
      } else {
        return false;
      }
    }
  })
  messageThreads(
    @Root() threadPayload: AddMessagePayload,
    // @ts-ignore
    @Arg("data", () => AddMessageToThreadInput_v2)
    input: AddMessageToThreadInput_v2
  ): AddMessagePayload {
    console.log("forced to use input".toUpperCase(), input);
    console.log(
      "forced to use threadPayload".toUpperCase(),
      JSON.stringify(threadPayload, null, 2)
    );
    return threadPayload; // createdAt: new Date()
  }

  // @ts-ignore
  @Mutation(type => AddMessagePayload)
  async addMessageToThread(
    @Ctx() context: MyContext,
    // @ts-ignore
    @Args(type => AddMessageToThreadInput) input: AddMessageToThreadInput,
    // @ts-ignore
    @PubSub("THREADS") publish: Publisher<AddMessagePayload>
    // @PubSub("POSTS_GLOBAL") publishGlbl: Publisher<PostPayload>,
  ): Promise<IAddMessagePayload> {
    const sentBy = await User.findOne(context.userId);

    const receiver = await User.findOne(input.sentTo);

    let existingThread;
    let newMessage;

    // const lastImage = input.images.length > 0 ? input.images.length - 1 : 0;

    // const incomingImages = await input.images;

    if (sentBy && receiver && input.images && input.images[0]) {
      // if there are images save them. if not make the message without it

      const { filename, createReadStream } = await input.images![0];

      let imageName = `${filename}.png`;

      let localImageUrl = `/../../../public/tmp/images/${imageName}`;

      let publicImageUrl = `http://192.168.1.10:4000/temp/${imageName}`;

      await new Promise((resolve, reject) => {
        createReadStream()
          .pipe(createWriteStream(__dirname + localImageUrl))
          .on("finish", () => {
            resolve(true);
          })
          .on("error", () => {
            reject(false);
          });
      });

      let newImage = await Image.create({
        uri: publicImageUrl,
        //@ts-ignore
        user: context.userId
      }).save();

      let createMessage = {
        message: input.message,
        user: receiver,
        sentBy,
        images: [newImage]
      };

      // CREATING rather than REPLYING to message...
      newMessage = await Message.create(createMessage).save();

      newImage.message = newMessage;
      // let mySavedImage = await newImage.save();
      console.log("newImage".toUpperCase(), JSON.stringify(newImage, null, 2));

      let existingThread = await Thread.findOne(input.threadId, {
        relations: ["messages", "invitees", "messages.images"]
      }).catch(error => error);

      const foundThread = existingThread && existingThread.id ? true : false;

      existingThread.messages.push(newMessage);
      existingThread.save();

      const returnObj = {
        success: existingThread && foundThread ? true : false,
        threadId: input.threadId,
        message: newMessage,
        user: receiver
      };

      // const readyThreadPayload = returnObj;
      console.log(
        "returnObj w/ Image".toUpperCase(),
        JSON.stringify(returnObj, null, 2)
      );
      await publish(returnObj);

      return returnObj;
    }

    if (
      (sentBy && receiver && input.images === undefined) ||
      (sentBy && receiver && input.images!.length == 0)
    ) {
      let createMessage = {
        message: input.message,
        user: receiver,
        sentBy
      };

      existingThread = await Thread.findOne(input.threadId, {
        relations: ["messages", "invitees", "messages.images"]
      }).catch(error => error);

      // CREATING rather than REPLYING to message...
      newMessage = await Message.create(createMessage).save();

      const returnObj = {
        success: existingThread && existingThread.id ? true : false,
        threadId: input.threadId,
        message: newMessage,
        user: receiver
      };

      // const readyThreadPayload = returnObj;
      console.log(
        "returnObj w/out Image".toUpperCase(),
        JSON.stringify(returnObj, null, 2)
      );
      await publish(returnObj);

      return returnObj;
    } else {
      console.log("WHAT IS INPUT.IMAGES", input.images);
      throw Error(
        `unable to find sender or receiver / sender / image: ${sentBy}\nreceiver: ${receiver}`
      );
    }
  }
}
