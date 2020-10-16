import { Arg, Resolver, Query, Mutation, UseMiddleware } from "type-graphql";
import bcrypt from "bcryptjs";

import { User } from "../../entity/User";
import { RegisterInput } from "./register/RegisterInput";
import { isAuth } from "../middleware/isAuth";
import { logger } from "../middleware/logger";
import { sendEmail } from "../utils/sendEmail";
import { createConfirmationUrl } from "../utils/createConfirmationUrl";
import { UserResponse } from "./user-response";

@Resolver()
export class RegisterResolver {
  @UseMiddleware(isAuth, logger)
  @Query(() => String, { name: "helloWorld", nullable: false })
  async hello() {
    return "Hello World";
  }

  @Mutation(() => UserResponse)
  async register(
    @Arg("data")
    { email, password, username }: RegisterInput
  ): Promise<UserResponse> {
    if (username.length < 2) {
      return {
        errors: [
          {
            field: "username",
            message: "Length must be greater than 2.",
          },
        ],
      };
    }
    if (password.length <= 3) {
      return {
        errors: [
          {
            field: "password",
            message: "Length must be greater than 3.",
          },
        ],
      };
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    let user;
    try {
      user = await User.create({
        // firstName,
        // lastName,
        email,
        username,
        count: 0,
        password: hashedPassword,
      }).save();

      // If a User is not returned but it does not trigger
      // a database error, return an error.
      if (!user) {
        return {
          errors: [
            {
              field: "username",
              message: "That username is reserved already, please try another.",
            },
          ],
        };
      }
    } catch (error) {
      // Check for TypeOrm (or Postgres) error code "23505",
      // for duplicate keys.
      if (error.code === "23505") {
        return {
          errors: [
            {
              field: "username",
              message: "That username is reserved already, please try another.",
            },
          ],
        };
      }
      // If it is some other database retrieval error,
      // return the message to the user, for now.
      return {
        errors: [
          {
            field: "username",
            message: error.message,
          },
        ],
      };
    }

    // If the code can execute this far registration is successful.
    // Send their confirmation email and return the user.
    await sendEmail(email, await createConfirmationUrl(user.id));
    return {
      user,
    };
  }
}
