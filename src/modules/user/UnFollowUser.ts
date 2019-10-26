import { Resolver, Mutation, Ctx, InputType, Arg, Field } from "type-graphql";

import { User } from "../../entity/User";
import { MyContext } from "../../types/MyContext";
import util from "util";

@InputType()
export class UnFollowUserInput {
  @Field()
  userIDToUnFollow: string;
}

@Resolver()
export class UnFollowUser {
  @Mutation(() => Boolean, { nullable: false })
  async unFollowUser(
    @Arg("data", { nullable: false })
    { userIDToUnFollow }: UnFollowUserInput,
    @Ctx() ctx: MyContext
  ): Promise<boolean> {
    // @ts-ignore
    let me = ctx.req && ctx.req.session ? ctx.req.session.userId : null;

    await User.createQueryBuilder()
      .relation(User, "followers")
      .of(userIDToUnFollow) // you can use just post id as well
      .remove(me)
      .then(data =>
        console.log(
          "WHAT DOES THE UNFOLLOW USER DATA LOOK LIKE AFTER DELETION?",
          data
        )
      )
      .catch(error => {
        let { message, name } = error;
        console.error(
          `Error unfollowing user: ${util.inspect(
            { name, message },
            true,
            2,
            true
          )}`
        );
      }); // you can use just category id as well

    return true;
  }
}
