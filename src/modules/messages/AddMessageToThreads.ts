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
}

@ObjectType()
export class AddMessagePayload {
  @Field(() => Boolean)
  success: boolean;
  @Field(() => Message)
  message: Message;

  @Field(() => ID)
  threadId: string;
}

@Resolver()
export class AddMessageToThreadResolver {
  // @ts-ignore
  @Subscription(type => AddMessagePayload, {
    // @ts-ignore
    topics: (context: any) => {
      //   if (!context.userId) {
      //     throw new Error("not authed");
      //   }

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
      // console.log("args".toUpperCase(), args);
      // console.log("payload booooy".toUpperCase(), payload);
      // // @ts-ignore
      // console.log("Does it match?", args.data.threadId === payload.threadId);
      // console.log("MATCH PAYLOAD THREADID".toUpperCase(), payload.threadId);
      // // @ts-ignore
      // console.log("MATCH ARGS THREADID".toUpperCase(), args.data.threadId);
      if (messageMatchesThread) return true;
      return false;
    }
    // filter: ({ payload, args }) => args.priorities.includes(payload.priority),
  })
  messageThreads(
    @Root() threadPayload: AddMessagePayload,
    // @ts-ignore
    @Arg("data", () => AddMessageToThreadInput_v2)
    input: AddMessageToThreadInput_v2
  ): AddMessagePayload {
    // do some stuff
    console.log("forced to use input".toUpperCase(), input);
    // console.log("threadPayload".toUpperCase(), threadPayload);
    return threadPayload;
    // createdAt: new Date()
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

    let createMessage = {
      message: input.message,
      user: receiver,
      sentBy
    };

    // CREATING rather than REPLYING to message...
    const newMessage = await Message.create(createMessage).save();

    let existingThread;

    if (sentBy && receiver) {
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
      message: newMessage
    };

    // const readyThreadPayload = returnObj;
    await publish(returnObj);
    console.log("returnObj published", returnObj);

    return returnObj;
  }
}
