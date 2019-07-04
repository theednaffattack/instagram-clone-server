import { Args, Resolver, Ctx, Mutation } from "type-graphql";

import { MessageThreadFromUserInput } from "./MessageThreadInput";
import { MyContext } from "../../types/MyContext";
import { Thread } from "../../entity/Thread";
import { Message } from "../../entity/Message";
import { User } from "../../entity/User";

@Resolver()
export class CreateMessageThreadResolver {
  // @ts-ignore
  @Mutation(type => Thread)
  async createMessageThread(
    @Ctx() context: MyContext,
    // @ts-ignore
    @Args(type => MessageThreadFromUserInput) input: MessageThreadFromUserInput
  ) {
    console.log("input".toUpperCase(), input);

    const sentBy = await User.findOne(context.userId);

    const receiver = await User.findOne(input.sentTo);

    let createMessage = {
      message: input.message,
      user: receiver,
      sentBy
    };

    // CREATING rather than REPLYING to message...
    const newMessage = await Message.create(createMessage).save();

    let newThread;

    if (sentBy && receiver) {
      let createThread = {
        user: sentBy,
        invitees: [sentBy, receiver],
        messages: [newMessage]
      };
      newThread = await Thread.create(createThread)
        .save()
        .catch(error => error);
    } else {
      throw Error(
        `unable to find sender or receiver\nsender: ${sentBy}\nreceiver: ${receiver}`
      );
    }

    console.log("newThread", newThread);

    return newThread;
  }
}
