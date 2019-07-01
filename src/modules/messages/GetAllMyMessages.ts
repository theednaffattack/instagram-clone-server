import { Resolver, Query, Ctx } from "type-graphql";

import { MyContext } from "../../types/MyContext";
import { User } from "../../entity/User";
// import { Message } from "../../entity/Message";

@Resolver()
export class GetAllMessagesResolver {
  // @ts-ignore
  @Query(type => User, { nullable: true })
  async getAllMyMessages(@Ctx() context: MyContext) {
    // const myMessages = await Message.createQueryBuilder("message")
    //   .leftJoinAndMapMany("message.mappedMessages", "message.user", "user")
    //   .where("user.id = :id", { id: context.userId })
    //   .getMany();

    const myUser = await User.createQueryBuilder("user")
      //   .leftJoinAndSelect("user.messages", "message")
      //   .leftJoinAndSelect("message.sentBy", "sentBy")

      .leftJoinAndMapMany(
        "user.mappedMessages",
        "user.messages",
        "message"
        // "message.sentBy <> ''"
      )
      .leftJoinAndSelect("message.sentBy", "sentBy")
      .leftJoinAndSelect("message.user", "m_user")
      .where("user.id = :id", { id: context.userId })
      .groupBy("user.id")
      .addGroupBy("message.id")
      //   .addGroupBy("user.firstName")
      .addGroupBy("sentBy.id")
      .addGroupBy("m_user.id")
      //   .addGroupBy("sentBy.firstName")
      .orderBy({ "message.createdAt": "DESC" }) // "sentBy.firstName": "ASC",
      //   .addGroupBy("message.sentBy.id")
      .getOne();

    console.log("myUser.messages", myUser);
    console.log("myUser.messages", myUser!.messages);
    console.log("myUser.messages", myUser!.sent_messages);
    // console.log("myMessages", myMessages);
    // console.log("myMessages[0]", myMessages[0]);
    // console.log("myMessagess[0].mappedMessages", myMessages[0].mappedMessages);

    return myUser;
  }
}
