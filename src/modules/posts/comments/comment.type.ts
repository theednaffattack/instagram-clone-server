import { ObjectType, Field, ID } from "type-graphql";

import { User } from "../../../entity/User";
import { Post } from "../../../entity/Post";
import { Comment as CommentEntity } from "../../../entity/Comment";

@ObjectType()
export class Comment {
  @Field()
  content: string;

  @Field(() => User)
  user: User;

  @Field(() => Post)
  post: Post;
}

@ObjectType()
export class CommentSubReturn implements Partial<CommentEntity> {
  @Field()
  content: string;

  @Field(() => Date, { nullable: true })
  created_at: string;
}

export interface AddCommentPayloadInterface {
  id: string;
  post: Post;
  user: User;
  created_at: string; // limitation of Redis payload serialization
  content: string;
}

@ObjectType()
export class AddCommentPayloadType {
  @Field(() => ID)
  id: string;

  // @ts-ignore
  @Field(type => ID)
  postId: string;

  // @ts-ignore
  @Field(type => ID)
  userId: string;

  @Field(() => Date, { nullable: true })
  created_at: string; // limitation of Redis payload serialization

  @Field(() => String)
  content: string;
}
