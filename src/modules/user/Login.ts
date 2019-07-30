import { Arg, Resolver, Mutation, Ctx } from "type-graphql";
import bcrypt from "bcryptjs";
// import { sign } from "jsonwebtoken";

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
    const user = await User.findOne({ where: { email } });
    if (!user || !secret) {
      return null;
    }
    // if we can't find a user return an obscure result (null) to prevent fishing
    // let accessToken;
    // let refreshToken;

    // const accessToken = sign({ userId: user.id, count: user.count }, secret, {
    //   expiresIn: "15min"
    // });

    // const refreshToken = sign({ userId: user.id }, secret, { expiresIn: "7d" });

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
