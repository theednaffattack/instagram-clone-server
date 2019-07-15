import { Resolver, Query, Ctx, UseMiddleware } from "type-graphql";

import { MyContext } from "../../types/MyContext";
import { Thread } from "../../entity/Thread";
import { isAuth } from "../middleware/isAuth";
// import { logger } from "../middleware/logger/logger";

@Resolver()
export class GetMessageThreadsResolver {
  @UseMiddleware(isAuth)
  @Query(() => [Thread], { nullable: "itemsAndList" })
  async getMessageThreads(@Ctx() context: MyContext) {
    const qThreads = await Thread.createQueryBuilder("thread")
      .leftJoinAndSelect("thread.messages", "message")
      .leftJoinAndSelect("message.sentBy", "sentBy")
      .leftJoinAndSelect("message.user", "user")
      .leftJoinAndSelect("message.images", "image")
      .leftJoinAndSelect("thread.invitees", "userB")

      .where("userB.id = :id", { id: context.userId })
      .orderBy("message.created_at", "ASC")
      .getMany();

    // const myThreads = await Thread.find({
    //   where: { invitees: context.userId },
    //   relations: ["invitees", "messages", "messages.user", "messages.sentBy"]
    // });

    let cache: any = [];

    qThreads.forEach(thread => {
      const sortedMessages = thread.messages.sort(function(a, b) {
        return a.created_at.getTime() - b.created_at.getTime(); // ASC
        // return b.created_at.getTime() - a.created_at.getTime(); // DESC
      });
      const copyThread = {
        ...thread,
        messages: [...sortedMessages]
      };
      cache.push(copyThread);
    });

    let newData = {
      getMessageThreads: [...cache]
    };
    console.log("VIEW THREADS newData", JSON.stringify(newData, null, 2));
    // console.log("VIEW THREADS myThreads", myThreads);
    return newData.getMessageThreads;
  }
}
