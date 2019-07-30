import { Resolver, Mutation, Ctx, InputType, Arg, Field } from "type-graphql";

import { User } from "../../entity/User";
import { MyContext } from "../../types/MyContext";

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

    // const removeMyselfFromTheirFollowers_v2 = await User.createQueryBuilder(
    //   "user"
    // )
    //   .leftJoinAndSelect("user.followers", "follower", "user.id = :id", {
    //     id: me
    //   })
    //   .delete()
    //   // .where("user.name = :name", { name: "Timber" })
    //   .execute();
    // .getOne();

    await User.createQueryBuilder()
      .relation(User, "followers")
      .of(userIDToUnFollow) // you can use just post id as well
      .remove(me)
      .catch(error =>
        console.error(`Error unfollowing userId: ${userIDToUnFollow}`, error)
      ); // you can use just category id as well

    // let removeSomeoneFromThoseIFollow = await User.createQueryBuilder()
    //   .relation(User, "following")
    //   .of(userIDToUnFollow) // you can use just post id as well
    //   .remove(me); // you can use just category id as well

    // console.log("removeSomeoneFromThoseIFollow", removeSomeoneFromThoseIFollow);

    return true;
  }
}
