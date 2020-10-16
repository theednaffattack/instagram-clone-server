import { IsEmail, Length } from "class-validator";
import { Field, InputType } from "type-graphql";

import { IsEmailAlreadyRegistered } from "./is-email-already-registered";
import { PasswordInput } from "../../shared/PasswordInput";
import { IsUsernameAlreadyRegistered } from "./is-username-already-registered";

@InputType()
export class RegisterInput extends PasswordInput {
  // @Field()
  // @Length(1, 255)
  // firstName: string;

  // @Field()
  // @Length(1, 255)
  // lastName: string;

  @Field()
  @IsEmail()
  @IsEmailAlreadyRegistered({ message: "email address is already registered" })
  email: string;

  @Field()
  @Length(3, 20)
  @IsUsernameAlreadyRegistered({ message: "username is already registered" })
  username: string;

  @Field()
  termsAndConditions: boolean;

  @Field()
  keepMeSignedIn: boolean;
}
