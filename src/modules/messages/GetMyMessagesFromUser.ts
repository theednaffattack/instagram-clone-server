import { Resolver, Query, Arg, Ctx } from "type-graphql";

import { Message } from "../../entity/Message";
import { GetMessagesFromUserInput } from "./MessageInput";
import { MyContext } from "../../types/MyContext";

@Resolver()
export class GetMyMessagesFromUserResolver {
  // @ts-ignore
  @Query(type => [Message], { nullable: true })
  async getMyMessagesFromUser(
    @Ctx() context: MyContext,
    // @ts-ignore
    @Arg("input", type => GetMessagesFromUserInput)
    input: GetMessagesFromUserInput
  ) {
    const newMessages: Message[] = await Message.find({
      where: { userId: context.userId, sentBy: input.sentBy },
      relations: ["user"]
    });

    return newMessages;
  }
}
