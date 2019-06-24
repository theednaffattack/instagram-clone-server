import { InputType, Field, ID } from "type-graphql";

@InputType()
export class MyImagesInput {
  // @ts-ignore
  @Field(type => ID)
  me: string;
}
