import { Length } from "class-validator";
import { Field, InputType } from "type-graphql";

@InputType()
export class ResendConfirmationEmailInput {
  @Field()
  @Length(3, 20)
  username: string;
}
