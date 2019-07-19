import { Arg, Resolver, Mutation, Ctx } from "type-graphql";
import bcrypt from "bcryptjs";
import { sign } from "jsonwebtoken";

import { User } from "../../entity/User";
import { MyContext } from "../../types/MyContext";

const secret = process.env.JWT_SECRET;

@Resolver()
export class LoginResolver {
  @Mutation(() => User, { nullable: true })
  async login(
    @Arg("email") email: string,
    @Arg("password") password: string,
    @Ctx() ctx: MyContext
  ): Promise<User | null> {
    console.log("LOGIN RUNNING");
    const user = await User.findOne({ where: { email } });
    if (!user || !secret) {
      return null;
    }
    // if we can't find a user return an obscure result (null) to prevent fishing
    // let accessToken;
    // let refreshToken;

    const accessToken = sign({ userId: user.id, count: user.count }, secret, {
      expiresIn: "15min"
    });

    const refreshToken = sign({ userId: user.id }, secret, { expiresIn: "7d" });

    console.log("CHECK THE TOKENS", { refreshToken, accessToken });

    ctx.res.cookie("refresh-token", refreshToken, {
      expires: new Date(Date.now() + 60 * 60 * 24 * 7)
    });

    ctx.res.cookie("access-token", accessToken, {
      expires: new Date(Date.now() + 60 * 15)
    });

    console.log("I HAVE MADE CHANGES");
    console.log("\n\n session", ctx);
    console.log("\n\nuser", user);
    if (!user) {
      return null;
    }

    const valid = bcrypt.compare(password, user.password);

    // if the supplied password is invalid return early
    if (!valid) {
      console.log("\n\n passwords don't match");

      return null;
    }

    // if the user has not confirmed via email
    if (!user.confirmed) {
      throw new Error("Please confirm your account");
      // return null;
    }
    // all is well return the user we found
    ctx.req.session!.userId = user.id;
    console.log("\n\n ctx.req.session (is userId present?)", ctx.req.session);

    return user;
  }
}
