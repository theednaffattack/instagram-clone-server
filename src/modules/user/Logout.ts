import { Resolver, Mutation, Ctx } from "type-graphql";

import { COOKIE_NAME } from "../../constants";
import { MyContext } from "../../types/MyContext";

@Resolver()
export class LogoutResolver {
  @Mutation(() => Boolean)
  async logout(
    @Ctx()
    ctx: MyContext
  ): Promise<Boolean> {
    return new Promise((resolve) => {
      return ctx.req.session!.destroy((err) => {
        if (err) {
          console.error(err);
          return resolve(false);
        }

        ctx.res.clearCookie(COOKIE_NAME);
        return resolve(true);
      });
    });
  }
}
