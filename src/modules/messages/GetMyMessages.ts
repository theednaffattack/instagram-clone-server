// import { PubSubEngine } from "graphql-subscriptions";

import { Resolver, Query, Arg, Ctx } from "type-graphql";

// import { MessageInput, MessageOutput } from "./MessageInput";
// import { GetMessagesInput } from "./MessageInput";
import { Message } from "../../entity/Message";
import { GetMessagesInput } from "./MessageInput";
import { MyContext } from "../../types/MyContext";
// import { User } from "../../entity/User";
// import { MessageSubType } from "./message.type";
// import { MyContext } from "../../types/MyContext";

// const tempDevUserId = "00a33f72-4a23-4753-a607-d98aaaed69f9";

@Resolver()
export class GetMyMessagesResolver {
  // @ts-ignore
  @Query(type => [Message], { nullable: true })
  async getMyMessages(
    @Ctx() context: MyContext,
    // @ts-ignore
    @Arg("input", type => GetMessagesInput) input: GetMessagesInput
  ) {
    const newMessages: Message[] = await Message.find({
      where: { userId: context.userId, sentBy: input.sentBy }
    });

    const groupedMessages = await Message.createQueryBuilder("message")
      //   .select('"sentBy"')
      .where('"sentBy" = :sentBy', { sentBy: input.sentBy })
      .groupBy('"sentBy"')
      .addGroupBy("id")
      .getMany();
    console.log(groupedMessages);
    return newMessages;
  }
}
