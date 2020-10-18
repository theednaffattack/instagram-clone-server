import { Resolver, Mutation, Arg, Ctx } from "type-graphql";
import bcrypt from "bcryptjs";

import { redis } from "../../redis";
import { User } from "../../entity/User";
import { forgotPasswordPrefix } from "../constants/redisPrefixes";
import { ChangePasswordInput } from "./changePassword/ChangePasswordInput";
import { MyContext } from "src/types/MyContext";
import { UserResponse } from "./user-response";

@Resolver()
export class ChangePasswordResolver {
  @Mutation(() => UserResponse, { nullable: true })
  async changePassword(
    @Arg("data")
    { token, password }: ChangePasswordInput,
    @Ctx() ctx: MyContext
  ): Promise<UserResponse> {
    const userId = await redis.get(forgotPasswordPrefix + token);
    // token expired in redis, possibly bad token
    if (!userId) {
      return {
        errors: [
          {
            field: "token",
            message: "invalid token",
          },
        ],
      };
    }

    const user = await User.findOne(userId);

    // can't find a user in the db
    if (!user) {
      return {
        errors: [
          {
            field: "token",
            message: "user no longer exists",
          },
        ],
      };
    }

    // don't allow this token to be used to change
    // password again
    await redis.del(forgotPasswordPrefix + token);

    // security
    user.password = await bcrypt.hash(password, 12);

    // save updated password
    await user.save();

    // optional - login in the user
    ctx.req.session!.userId = user.id;

    return {
      user,
    };
  }
}
