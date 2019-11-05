import { Comment } from "./comment.type";
import { ID, Field, InputType } from "type-graphql";

@InputType()
export class CommentInput implements Partial<Comment> {
  @Field(() => ID)
  postId: string;

  @Field()
  content: string;
}
