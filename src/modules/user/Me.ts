import { Resolver, Query, Ctx, UseMiddleware } from "type-graphql";

import { User } from "../../entity/User";
import { MyContext } from "../../types/MyContext";
import { isAuth } from "../middleware/isAuth";

@Resolver()
export class MeResolver {
  @Query(() => User, { nullable: true })
  @UseMiddleware(isAuth)
  async me(@Ctx() ctx: MyContext): Promise<User | undefined> {
    // if we can't find a userId on the current session

    if (!ctx.userId) {
      return undefined;
    }

    return User.findOne(ctx.userId);
  }
}
