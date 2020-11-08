import { Arg, Resolver, Mutation } from "type-graphql";

import { redis } from "../../redis";
import { User } from "../../entity/User";
import { confirmUserPrefix } from "../constants/redisPrefixes";
// import { MyContext } from "../../types/MyContext";

@Resolver()
export class ConfirmUserResolver {
  @Mutation(() => Boolean)
  async confirmUser(@Arg("token") token: string): Promise<boolean> {
    let userId;
    try {
      userId = await redis.get(confirmUserPrefix + token);
    } catch (error) {
      console.warn("USER CONFIRMATION", error);
    }

    if (!userId) {
      return false;
    }

    // Update the user to be confirmed and remove the token from redis
    try {
      await User.update({ id: userId }, { confirmed: true });
    } catch (error) {
      throw Error(`User confirmation error:\n${error}`);
    }

    try {
      await redis.del(confirmUserPrefix + token);
    } catch (error) {
      throw Error(`User token deletion error:\n${error}`);
    }

    // all is well return the user we found

    // ctx.req.session!.userId = userId;
    // console.log("VIEW CONFIRM USER RESPONSE", { userId, ctx: ctx.req.session });
    return true;
  }
}
