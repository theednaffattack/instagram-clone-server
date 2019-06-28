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
  @Mutation(() => Boolean)
  async followUser(
    @Arg("data", { nullable: false })
    { userIDToFollow }: FollowUserInput,
    @Ctx() ctx: MyContext
  ): Promise<boolean> {
    let me = ctx.req && ctx.req.session ? ctx.req.session.userId : null;

    const isUserAFollower = await User.createQueryBuilder("user")
      .leftJoinAndSelect("user.followers", "follower")
      .where("user.id = :id", {
        id: userIDToFollow
      })
      .where("follower.id = :fid", { fid: me })
      .getOne();

    console.log("TIEMBER", isUserAFollower);

    if (!isUserAFollower) {
      let findRelationship;

      findRelationship = async () => {
        await User.createQueryBuilder()
          .relation(User, "followers")
          .of(userIDToFollow)
          .add(me)
          .catch(error => console.error("MY ERROR:", error)); // you can use just category id as well
      };
      console.log("findRelationship".toUpperCase(), findRelationship());
      return true;
    }

    if (isUserAFollower) {
      return false;
    }
    throw Error("Oh no! this isn't intended to be reachable");
  }
}
