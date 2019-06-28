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
  @Mutation(() => User, { nullable: true })
  async unFollowUser(
    @Arg("data", { nullable: false })
    { userIDToUnFollow }: UnFollowUserInput,
    @Ctx() ctx: MyContext
  ): Promise<any> {
    let me = ctx.req && ctx.req.session ? ctx.req.session.userId : null;

    // let removeMyselfFromTheirFollowers = await User.createQueryBuilder()
    //   .relation(User, "followers")
    //   .of(userIDToUnFollow) // you can use just post id as well
    //   .remove(me); // you can use just category id as well

    let removeOneFromThoseIFollow = await User.createQueryBuilder()
      .relation(User, "following")
      .of(me) // you can use just post id as well
      .remove(userIDToUnFollow); // you can use just category id as well

    // console.log(removeMyselfFromTheirFollowers);
    console.log(removeOneFromThoseIFollow);

    return removeOneFromThoseIFollow;
  }
}
