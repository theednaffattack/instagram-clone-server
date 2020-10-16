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

    let passwordComparison: "isValid" | "isNotValid";

    try {
      if (await bcrypt.compare(password, user.password)) {
        // password is valid
        passwordComparison = "isValid";
      } else {
        // password is NOT valid (did not match)
        passwordComparison = "isNotValid";

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

    // if the supplied password is invalid return early
    // if (!valid) {
    // if (passwordComparison === "isNotValid") {
    //   return {
    //     errors: [
    //       {
    //         field: "login",
    //         message: "Invalid login.",
    //       },
    //     ],
    //   };
    // }

    // if the user has not confirmed via email
    if (!user.confirmed && passwordComparison === "isValid") {
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
