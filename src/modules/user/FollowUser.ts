import { Resolver, Mutation, Ctx, InputType, Arg, Field } from "type-graphql";

import { User } from "../../entity/User";
import { MyContext } from "../../types/MyContext";

@InputType()
export class FollowUserInput {
  @Field()
  userIDToFollow: string;
}

@Resolver()
export class FollowUser {
  @Mutation(() => User, { nullable: true })
  async followUser(
    @Arg("data", { nullable: false })
    { userIDToFollow }: FollowUserInput,
    @Ctx() ctx: MyContext
  ): Promise<any> {
    let me = ctx.req && ctx.req.session ? ctx.req.session.userId : null;

    let addMyselfToTheirFollowers = await User.createQueryBuilder()
      .relation(User, "followers")
      .of(userIDToFollow) // you can use just post id as well
      .add(me); // you can use just category id as well

    // let addThemToThoseIFollow = await User.createQueryBuilder()
    //   .relation(User, "following")
    //   .of(me) // you can use just post id as well
    //   .add(userIDToFollow); // you can use just category id as well

    console.log(addMyselfToTheirFollowers);
    // console.log(addThemToThoseIFollow);

    return addMyselfToTheirFollowers;
  }
}
