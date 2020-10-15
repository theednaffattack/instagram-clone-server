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
    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await User.create({
      // firstName,
      // lastName,
      email,
      username,
      count: 0,
      password: hashedPassword,
    }).save();

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

    await sendEmail(email, await createConfirmationUrl(user.id));
    return {
      user,
    };
  }
}
