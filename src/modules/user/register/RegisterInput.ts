import { IsEmail } from "class-validator";
import { Field, InputType } from "type-graphql";
import { IsEmailAlreadyExist } from "./isEmailAlreadyExists";
import { PasswordInput } from "../../shared/PasswordInput";

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
  @IsEmailAlreadyExist({ message: "email already in use" })
  email: string;

  @Field()
  username: string;

  @Field()
  termsAndConditions: boolean;

  @Field()
  keepMeSignedIn: boolean;
}
