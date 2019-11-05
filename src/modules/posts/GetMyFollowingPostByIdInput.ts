import { InputType, Field, ID } from "type-graphql";

@InputType()
export class GetMyFollowingPostByIdInput {
  @Field(() => ID)
  postId: string;
}
