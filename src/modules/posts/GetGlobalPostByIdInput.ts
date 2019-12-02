import { InputType, Field, ID } from "type-graphql";

@InputType()
export class GetGlobalPostByIdInput {
  @Field(() => ID)
  postId: string;
}
