import { Arg, Resolver, Mutation, Ctx } from "type-graphql";
import bcrypt from "bcryptjs";
import logger from "pino";

import { User } from "../../entity/User";
import { MyContext } from "../../types/MyContext";
import { UserResponse } from "./user-response";

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

    // if the user has not confirmed via email
    if (!user.confirmed) {
      return {
        errors: [
          {
            field: "user_confirmed",
            message:
              "An email has been sent to confrim your registration. Please follow the link provided to confirm your account.",
          },
        ],
      };
      // throw new Error("Please confirm your account");
      // return null;
    }

    try {
      if (await bcrypt.compare(password, user.password)) {
        // password is valid

        // all is well return the user we found
        ctx.req.session!.userId = user.id;

        return {
          user,
        };
      } else {
        // password is NOT valid (did not match)

        return {
          errors: [
            {
              field: "password",
              message: "Invalid login.",
            },
          ],
        };
      }
    } catch (error) {
      logger().info({
        type: "error",
        name: "bcrypt-error",
        ms: "milliseconds-placeholder",
      });

      // I should consider returning invalid password, instead.
      return {
        errors: [
          {
            field: "password",
            message: `Invalid login.`,
          },
        ],
      };
    }
  }
}
