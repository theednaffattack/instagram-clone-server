import { Resolver, Query, Ctx } from "type-graphql";

import { MyContext } from "../../types/MyContext";
import { Thread } from "../../entity/Thread";
// import { In } from "typeorm";
// import { User } from "../../entity/User";
// import { Message } from "../../entity/Message";

@Resolver()
export class GetMessageThreadsResolver {
  // @ts-ignore
  @Query(type => [Thread])
  async getMessageThreads(@Ctx() context: MyContext) {
    // const qThreads = await Thread.find({
    //   join: {
    //     alias: "thread",
    //     leftJoinAndSelect: {
    //       invitee: "thread.invitees",
    //       message: "thread.messages"
    //       // video: "user.videos"
    //     }
    //   }
    // });
    const qThreads = await Thread.createQueryBuilder("thread")
      // .leftJoinAndSelect("thread.invitees", "user", "user.id = :id", {
      //   id: context.userId
      // })
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
