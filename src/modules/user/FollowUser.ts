import { Resolver, Mutation, Ctx, InputType, Arg, Field } from "type-graphql";
import util from "util";
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
    let me = ctx.userId;
    //  ctx.req && ctx.req.session ? ctx.req.session.userId : null;

    // guard: you can't follow yourself
    if (me === userIDToFollow) return false;

    // const isMeAFollower = await User.findOne(userIDToFollow, {
    //   relations: ["folllowers", "followers.user"],
    //   where: { followers: me }
    // });

    const isMeAFollower = await User.createQueryBuilder("user")
      .where({ id: userIDToFollow })
      .leftJoinAndSelect("user.followers", "follower", "follower.id = :id", {
        id: me,
      })
      .getOne()
      .catch((error) => {
        console.error("ERROR", util.inspect(error, true, 3, true));
      });

    // // find "me" as a follower of the user "I'd" like to follow
    // const isUserAFollower = await User.createQueryBuilder("user")
    //   .leftJoinAndSelect("user.followers", "follower")
    //   .where("user.id = :id", {
    //     id: userIDToFollow
    //   })
    //   .where("follower.id = :fid", { fid: me })
    //   .getOne();

    // // guard: already a follower
    // if (isUserAFollower) {
    //   console.log("isUserAFollower", isUserAFollower);
    //   console.log("\n\nme".toUpperCase(), me);
    //   console.log("\n\nuserIDToFollow".toUpperCase(), userIDToFollow);
    //   return false;
    // }

    // the main function, allow "me" to find and follow another user
    if (isMeAFollower && isMeAFollower.followers.length === 0) {
      await User.createQueryBuilder()
        .relation(User, "followers")
        .of(userIDToFollow)
        .add(me)
        .then((data) =>
          console.log(
            "DID WE FIND ANY DATA?",
            util.inspect(data, true, 2, true)
          )
        )
        .catch((error) => console.error("MY ERROR:", error)); // you can use just category id as well

      return true;
    }

    if (isMeAFollower && isMeAFollower.followers.length > 0) {
      return false;
    }

    throw Error("Oh no! this isn't intended to be reachable");
  }
}
