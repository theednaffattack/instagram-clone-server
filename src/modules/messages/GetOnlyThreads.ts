import { Resolver, Query, Ctx, UseMiddleware } from "type-graphql";
import util from "util";

import { MyContext } from "../../types/MyContext";
import { Thread } from "../../entity/Thread";
import { isAuth } from "../middleware/isAuth";
// import { logger } from "../middleware/logger/logger";

@Resolver()
export class GetOnlyThreads {
  @UseMiddleware(isAuth)
  @Query(() => [Thread], { nullable: "itemsAndList" })
  async getOnlyThreads(@Ctx() context: MyContext) {
    const experiment = await Thread.find({
      relations: ["invitees", "user"],
      where: { invitees: { id: context.userId } }
      // id: "c3b2817c-534d-42ce-b168-5565d306e85a"
    });

    // relations: ["invitees", "invitees.id"]
    console.log(util.inspect({ experiment }, false, 4, true));

    // const qThreads = await Thread.createQueryBuilder("thread")
    //   // .leftJoinAndSelect("thread.messages", "message")
    //   // .leftJoinAndSelect("message.sentBy", "sentBy")
    //   // .leftJoinAndSelect("message.images", "image")
    //   .leftJoinAndSelect("thread.user", "user")
    //   .leftJoinAndSelect("thread.invitees", "invitees")

    //   .where(":id = ANY(invitees.id)", { id: context.userId })
    //   // .where("userB.id = :id", { id: context.userId }) // old?
    //   // .where("userB.id IN (:...ids)", { ids: [context.userId] })
    //   .orderBy("thread.updated_at", "ASC")
    //   .getMany();

    // console.log("view qThreads", util.inspect(qThreads, false, 4, true));

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
      getMessageThreads: [...experiment]
    };

    // console.log(util.inspect(newData, false, 4));

    return newData.getMessageThreads;
  }
}
