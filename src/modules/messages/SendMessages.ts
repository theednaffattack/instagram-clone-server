// import { PubSubEngine } from "graphql-subscriptions";

import {
  Mutation,
  Publisher,
  PubSub,
  Subscription,
  Root,
  Args,
  Resolver,
  ResolverFilterData,
  Ctx
} from "type-graphql";

// import { MessageInput, MessageOutput } from "./MessageInput";
import { MessageFromUserInput } from "./MessageInput";
import { Message } from "../../entity/Message";
import { User } from "../../entity/User";
import { MessageSubType } from "./MessageSubType";
import { MessagePayload } from "./types";
import { MyContext } from "../../types/MyContext";

@Resolver()
export class SendMessageResolver {
  // @ts-ignore
  @Subscription(type => MessageSubType, {
    topics: ({ context }) => {
      if (!context.userId) {
        throw new Error("not authed");
      }
      return "MESSAGES";
    },

    // @ts-ignore
    filter: ({
      payload,
      args,
      context
    }: ResolverFilterData<MessagePayload, MessageFromUserInput, MyContext>) => {
      // if (
      //   context.userId === args.sentTo &&
      //   context.userId === payload.user.id
      // ) {
      //   return true;
      // } else {
      //   return false;
      // }
      return true;
      //   return payload.recipeId === args.recipeId;
      // I'll use the example return above to filter for the
      // current selected message thread
    }
    // filter: ({ payload, args }) => args.priorities.includes(payload.priority),
  })
  newMessage(
    @Root() messagePayload: MessagePayload,
    // @ts-ignore
    @Args(type => MessageFromUserInput) input: MessageFromUserInput
  ): MessagePayload {
    return {
      ...messagePayload
      // created_at: new Date()
    };
  }

  // @ts-ignore
  @Mutation(type => Boolean)
  async addNewMessage(
    @Ctx() context: MyContext,
    // @ts-ignore
    @PubSub("MESSAGES") publish: Publisher<MessagePayload>,
    // @ts-ignore
    @Args(type => MessageFromUserInput) input: MessageFromUserInput
  ): Promise<boolean> {
    // Promise<boolean>
    if (!context) {
      throw new Error("not authed");
    }

    const receiver = await User.findOne({
      where: {
        id: input.sentTo
      }
    });

    const sender = await User.findOne({
      where: {
        id: context.userId
      }
    });

    // "00a33f72-4a23-4753-a607-d98aaaed69f9"
    // "00840864-fa70-4b19-968a-0421b77b2074"

    const fullMessageInput = {
      created_at: new Date(),
      updated_at: new Date(),
      message: input.message,
      sentBy: sender, // (Jamey.Cassin@Eloise.org: Aisha Stanton) //SENDING User,
      user: receiver // (Reinger_Keaton@yahoo.com: Candelario Johnson) THE USER BEING SENT TO
    };

    const newMessage = await Message.create(fullMessageInput).save();

    // here we can trigger subscriptions topics
    await publish(newMessage);

    // this should return a boolean? Not sure if that's just the example
    // best practice
    return true;
  }
}
