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
  @Field(() => Message)
  message: Message;

  @Field(() => ID)
  threadId: string;

  @Field(() => User)
  user: User;
}

@Resolver()
export class AddMessageToThreadResolver {
  // @ts-ignore
  @Subscription(type => AddMessagePayload, {
    // @ts-ignore
    topics: ({ context }: any) => {
      if (!context.userId) {
        console.log("context".toUpperCase(), context);
        throw new Error("not authed");
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
        // console.log("ARGS DON'T MATCH?".toUpperCase(), args.data.threadId);
        return false;
      }
    }
    // filter: ({ payload, args }) => args.priorities.includes(payload.priority),
  })
  messageThreads(
    @Root() threadPayload: AddMessagePayload,
    // @ts-ignore
    @Arg("data", () => AddMessageToThreadInput_v2)
    input: AddMessageToThreadInput_v2
  ): AddMessagePayload {
    console.log("forced to use input".toUpperCase(), input);
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

    if (sentBy && receiver) {
      let createMessage = {
        message: input.message,
        user: receiver,
        sentBy
      };

      // CREATING rather than REPLYING to message...
      newMessage = await Message.create(createMessage).save();

      existingThread = await Thread.findOne(input.threadId, {
        relations: ["messages", "invitees"]
      }).catch(error => error);

      existingThread.messages.push(newMessage);
      existingThread.save();
    } else {
      throw Error(
        `unable to find sender or receiver\nsender: ${sentBy}\nreceiver: ${receiver}`
      );
    }

    const returnObj = {
      success: existingThread && existingThread.id ? true : false,
      threadId: input.threadId,
      message: newMessage,
      user: receiver
    };

    // const readyThreadPayload = returnObj;
    await publish(returnObj);

    return returnObj;
  }
}
