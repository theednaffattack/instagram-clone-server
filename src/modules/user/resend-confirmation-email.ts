import { Arg, Resolver, Query, Mutation, UseMiddleware } from "type-graphql";

import { User } from "../../entity/User";
import { ResendConfirmationEmailInput } from "./resend-confirmation-email-input";
import { isAuth } from "../middleware/isAuth";
import { logger } from "../middleware/logger";
import { sendEmail } from "../utils/sendEmail";
import { createConfirmationUrl } from "../utils/createConfirmationUrl";
import { UserResponse } from "./user-response";

@Resolver()
export class ResendConfirmationEmailResolver {
  @UseMiddleware(isAuth, logger)
  @Query(() => String, { name: "helloWorld", nullable: false })
  async hello() {
    return "Hello World";
  }

  @Mutation(() => UserResponse)
  async resendConfirmationEmail(
    @Arg("data")
    { username }: ResendConfirmationEmailInput
  ): Promise<UserResponse> {
    let user;
    try {
      user = await User.findOne({
        where: { username: username },
      });

      // If a User is not returned but it does not trigger
      // a database error, return an error.
      if (!user) {
        return {
          errors: [
            {
              field: "username",
              message: "Unable to find that username.",
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
    await sendEmail(user.email, await createConfirmationUrl(user.id));
    return {
      user,
    };
  }
}
