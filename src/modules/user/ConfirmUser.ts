import { Arg, Resolver, Mutation } from "type-graphql";

import { redis } from "../../redis";
import { User } from "../../entity/User";
import { confirmUserPrefix } from "../constants/redisPrefixes";

@Resolver()
export class ConfirmUserResolver {
  @Mutation(() => Boolean)
  async confirmUser(
    @Arg("token") token: string
    // @Ctx() ctx: MyContext
  ): Promise<boolean> {
    const userId = await redis.get(confirmUserPrefix + token);

    if (!userId) {
      return false;
    }

    // update the user to be confirmed and ditch the token from redis
    // @todo: prefix ALL redis tokens for readability
    await User.update({ id: userId }, { confirmed: true });
    await redis.del(token);

    return true;
  }
}
