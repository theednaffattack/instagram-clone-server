import { Resolver, Query, Ctx } from "type-graphql";

import { MyContext } from "../../types/MyContext";
import { User } from "../../entity/User";

@Resolver()
export class GetAllMessagesResolver {
  // @ts-ignore
  @Query(type => User, { nullable: true })
  async getAllMyMessages(@Ctx() context: MyContext) {
    const myUser = await User.createQueryBuilder("user")
      .leftJoinAndSelect("user.messages", "message")
      .leftJoinAndSelect("message.sentBy", "sentBy")
      .where("user.id = :id", { id: context.userId })
      .groupBy("user.id")
      .addGroupBy("message.id")
      .addGroupBy("user.firstName")
      .addGroupBy("sentBy.id")
      .addGroupBy("sentBy.firstName")
      .orderBy({ "sentBy.firstName": "ASC", "message.createdAt": "DESC" })
      //   .addGroupBy("message.sentBy.id")
      .getOne();

    console.log("myUser.messages", myUser);
    console.log("myUser.messages", myUser!.messages);
    console.log("myUser.messages", myUser!.sent_messages);

    return myUser;
  }
}
