import { Arg, Resolver, Mutation, Ctx } from "type-graphql";
import bcrypt from "bcryptjs";

import { User } from "../../entity/User";
import { MyContext } from "../../types/MyContext";

@Resolver()
export class LoginResolver {
  @Mutation(() => User, { nullable: true })
  async login(
    @Arg("email") email: string,
    @Arg("password") password: string,
    @Ctx() ctx: MyContext
  ): Promise<User | null> {
    const user = await User.findOne({ where: { email } });
    // if we can't find a user return an obscure result (null) to prevent fishing
    console.log("I HAVE MADE CHANGES");
    console.log("\n\n session", Object.keys(ctx));
    console.log("\n\nuser", user);
    if (!user) {
      return null;
    }

    const valid = bcrypt.compare(password, user.password);

    // if the supplied password is invalid return early
    if (!valid) {
      return null;
    }

    // if the user has not confirmed via email
    if (!user.confirmed) {
      throw new Error("Please confirm your account");
      // return null;
    }
    // all is well return the user we found
    ctx.req.session!.userId = user.id;
    return user;
  }
}
