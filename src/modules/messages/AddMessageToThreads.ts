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

export interface IAddMessagePayload {
  success: boolean;
  threadId: string;
  message: Message;
  user: User;
  invitees: User[];
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

  @Field(() => [User])
  invitees: User[];

  // @Field(() => [Image], { nullable: "itemsAndList" })
  // images?: Image[];
}

@Resolver()
export class AddMessageToThreadResolver {
  @Subscription(() => AddMessagePayload, {
    // @ts-ignore
    topics: ({ context }: any) => {
      if (!context.userId) {
        throw new Error("Not authorized for this topic");
      }

      return "THREADS";
    },

    // @ts-ignore
    filter: ({
      payload,
      args
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
    console.log("forced to use input".toUpperCase(), Object.keys(input));

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
    let newMessage: any;

    // const lastImage = input.images.length > 0 ? input.images.length - 1 : 0;

    // const incomingImages = await input.images;

    if (sentBy && receiver && input.images && input.images[0]) {
      const newImageData: Image[] = input.images.map(image =>
        Image.create({
          uri: `${image}`,
          user: sentBy
        })
      );

      // save that image to the database
      let newImages = await Promise.all(
        newImageData.map(async newImage => await newImage.save())
      );

      // add the images to the user.images
      // field / column
      if (newImages !== null && newImages.length > 0) {
        if (!sentBy.images || sentBy.images.length === 0) {
          sentBy.images = [...newImages];
        }
        if (sentBy.images && sentBy.images.length > 0) {
          sentBy.images = [...sentBy.images, ...newImages];
        }
      }

      let createMessage = {
        message: input.message,
        user: receiver,
        sentBy,
        images: [...newImages]
      };

      // CREATING rather than REPLYING to message...
      newMessage = await Message.create(createMessage).save();

      newImages.forEach(async image => {
        image.message = newMessage.id;
        await image.save();
        return image;
      });

      let existingThread = await Thread.findOne(input.threadId, {
        relations: ["messages", "invitees", "messages.images"]
      }).catch(error => error);

      const foundThread = existingThread && existingThread.id ? true : false;

      // existingThread.messages.push(newMessage);
      existingThread.last_message = input.message;

      existingThread.save();

      newMessage.thread = existingThread;

      await newMessage.save();

      let collectInvitees: any[] = [];

      await Promise.all(
        input.invitees.map(async person => {
          let tempPerson = await User.findOne(person);
          collectInvitees.push(tempPerson);
          return tempPerson;
        })
      );

      const returnObj = {
        success: existingThread && foundThread ? true : false,
        threadId: input.threadId,
        message: newMessage,
        user: receiver,
        invitees: [...collectInvitees]
      };

      await publish(returnObj).catch((error: Error) => {
        throw new Error(error.message);
      });

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

      newMessage = await Message.create(createMessage).save();

      existingThread.last_message = input.message;
      await existingThread.save();

      newMessage.thread = existingThread;

      await newMessage.save();

      let collectInvitees: User[] = [];

      await Promise.all(
        input.invitees.map(async person => {
          let tempPerson = await User.findOne(person);
          if (tempPerson) {
            collectInvitees.push(tempPerson);
          }
          return tempPerson;
        })
      );

      const returnObj = {
        success: existingThread && existingThread.id ? true : false,
        threadId: input.threadId,
        message: newMessage,
        user: receiver,
        invitees: [...collectInvitees]
      };

      await publish(returnObj);

      console.log("published!!! NO IMAGE".toUpperCase());
      return returnObj;
    } else {
      throw Error(
        `unable to find sender or receiver / sender / image: ${sentBy}\nreceiver: ${receiver}`
      );
    }
  }
}
