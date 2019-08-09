import {
  Resolver,
  Query,
  Ctx,
  UseMiddleware,
  Arg,
  InputType,
  Field,
  Int
} from "type-graphql";
// import util from "util";

import { MyContext } from "../../types/MyContext";
// import { Thread } from "../../entity/Thread";
import { isAuth } from "../middleware/isAuth";
import { Message } from "../../entity/Message";
import { Min, Max } from "class-validator";
// import { logger } from "../middleware/logger/logger";

@InputType()
export class GetMessagesByThreadIdInput {
  @Field(() => String)
  threadId: string;

  @Field(() => Int, { defaultValue: 0 })
  @Min(0)
  skip: number;

  @Field(() => Int, { defaultValue: 10 })
  @Min(1)
  @Max(25)
  take: number;

  // helpers - index calculations
  startIndex = this.skip;
  endIndex = this.skip + this.take;
}

@Resolver()
export class GetMessagesByThreadId {
  @UseMiddleware(isAuth)
  @Query(() => [Message], { nullable: "itemsAndList" })
  async getMessagesByThreadId(
    @Ctx() context: MyContext,
    @Arg("input", () => GetMessagesByThreadIdInput)
    input: GetMessagesByThreadIdInput
  ) {
    const qThreads = await Message.createQueryBuilder("message")
      // .leftJoinAndSelect("thread.messages", "message")
      // .leftJoinAndSelect("message.sentBy", "sentBy")
      .leftJoinAndSelect("message.user", "user")
      .leftJoinAndSelect("message.sentBy", "sentBy")
      // .leftJoinAndSelect("message.images", "image")
      .leftJoinAndSelect("message.thread", "thread")

      // .where("userB.id = :id", { id: context.userId }) // old?
      .where("userB.id IN (:...ids)", { ids: [context.userId] })
      .where("thread.id = :id", { id: input.threadId })
      .orderBy("thread.created_at", "ASC")
      .skip(input.skip)
      .take(input.take)
      .getMany();

    // const myThreads = await Thread.find({
    //   where: { invitees: context.userId },
    //   relations: ["invitees", "messages", "messages.user", "messages.sentBy"]
    // });

    // let cache: any = [];

    // qThreads.forEach(thread => {
    //   const sortedMessages = thread.messages.sort(function(a, b) {
    //     return a.created_at.getTime() - b.created_at.getTime(); // ASC
    //     // return b.created_at.getTime() - a.created_at.getTime(); // DESC
    //   });
    //   const copyThread = {
    //     ...thread,
    //     messages: [...sortedMessages]
    //   };
    //   cache.push(copyThread);
    // });

    let newData = {
      getMessageThreads: [...qThreads]
    };

    // console.log(util.inspect(newData, false, 4));

    return newData.getMessageThreads;
  }
}
