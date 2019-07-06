import { Resolver, Ctx, Query } from "type-graphql";

import { User } from "../../entity/User";
import { MyContext } from "../../types/MyContext";

@Resolver()
export class MeAndAllFollowers {
  @Query(() => User, { nullable: true })
  async meAndAllFollowers(@Ctx() ctx: MyContext): Promise<any> {
    let me = ctx.req && ctx.req.session ? ctx.req.session.userId : null;
    if (me) {
      let meWithFollowers = await User.findOne(me, {
        relations: ["followers", "following"]
      });

      return meWithFollowers;
    } else {
      throw Error("Authentication error");
    }
  }
}
