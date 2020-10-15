import { Arg, Resolver, Mutation, Ctx } from "type-graphql";
import argon2 from "argon2";
import bcrypt from "bcryptjs";
// import { sign } from "jsonwebtoken";

import { User } from "../../entity/User";
import { MyContext } from "../../types/MyContext";
import { UserResponse } from "./user-response";

const secret = process.env.JWT_SECRET;

@Resolver()
export class LoginResolver {
  @Mutation(() => UserResponse, { nullable: true })
  async login(
    @Arg("username") username: string,
    @Arg("password") password: string,
    @Ctx() ctx: MyContext
  ): Promise<UserResponse> {
    const user = await User.findOne({ where: { username } });
    // if we cannot find a user return an obscure error
    if (!user) {
      return {
        errors: [
          {
            field: "username",
            message: "A user could not be found by that username.",
          },
        ],
      };
    }
    const valid = await argon2.verify(user.password, password);

    // if the supplied password is invalid return early
    if (!valid) {
      return {
        errors: [
          {
            field: "login",
            message: "Invalid login.",
          },
        ],
      };
    }

    // if the user has not confirmed via email
    if (!user.confirmed) {
      return {
        errors: [
          {
            field: "user.confirmed",
            message:
              "An email has been sent to confrim your registration. Please follow the provided link to confirm your account.",
          },
        ],
      };
      // throw new Error("Please confirm your account");
      // return null;
    } else {
      // all is well return the user we found
      ctx.req.session!.userId = user.id;

      return {
        user,
      };
    }
  }
}
