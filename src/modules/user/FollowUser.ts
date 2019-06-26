import { Resolver, Mutation, Ctx, InputType, Arg, Field } from "type-graphql";

import { User } from "../../entity/User";
import { MyContext } from "../../types/MyContext";
// import { Follower } from "../../entity/Follower";

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

    // find the logged in user
    let userIsFollower = await User.findOne(me, { relations: ["followings"] });
    // userIsFollower.am_follower.push(me);

    // find the user to follow
    let userToFollow = await User.findOne(userIDToFollow, {
      relations: ["followers"]
    });

    // make the logged in user a follower of the user to follow
    if (userToFollow) {
      userToFollow.followers = me;
      await userToFollow.save();
    }

    // save the user to follow to "my" `follows`
    if (userIsFollower && userToFollow) {
      userIsFollower.followings.push(userToFollow);
      await userIsFollower.save();
    }
    // let createFollowing = await Follower.create({
    //   am_follower: me,
    //   followed_by: userToFollow
    // }).save();

    // console.log("userToFollow, userIsFollower");
    // console.log(userToFollow, userIsFollower);

    // if (userToFollow && userIsFollower) {
    //   userIsFollower.following.push(createFollowing);
    //   userToFollow.followers.push(createFollowing);
    // }

    // let fakePromise = await new Promise(resolve => resolve("hello"));
    return userToFollow;
  }
}
