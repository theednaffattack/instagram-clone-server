import { ObjectType, Field, Int, ID } from "type-graphql";

import { User } from "../entity/User";
import { Like } from "../entity/Like";
import { Image } from "../entity/Image";
import { Comment } from "../entity/Comment";

/**
 * @type {Object} FollowingPostReturnType
 */
@ObjectType()
export class FollowingPostReturnType {
  @Field(() => ID, { nullable: true })
  id: string;

  @Field({ nullable: true })
  title: string;

  @Field({ nullable: true })
  text: string;

  @Field(() => [Image], { nullable: true })
  images: Image[];

  @Field(() => [Like], { nullable: true })
  likes: Like[];

  @Field(() => [Comment], { nullable: true })
  comments: Comment[];

  @Field(() => Boolean, { nullable: true })
  isCtxUserIdAFollowerOfPostUser: boolean;

  @Field(() => User, { nullable: true })
  user: User;

  @Field(() => Date, { nullable: true })
  created_at: Date;

  @Field(() => Date, { nullable: true })
  updated_at?: Date;

  @Field(() => Int, { nullable: false })
  comments_count: number;

  @Field(() => Int, { nullable: false })
  likes_count: number;

  @Field(() => Boolean, { nullable: false })
  currently_liked: boolean;
}

@ObjectType()
export class HandlePostPayload {
  @Field(() => Boolean)
  success: boolean;

  @Field(() => String)
  action: string;

  @Field(() => ID, { nullable: true })
  id: string;

  @Field(() => Boolean, { nullable: true })
  title: string;

  @Field(() => [Image], { nullable: true })
  images: Image[];

  @Field(() => Boolean, { nullable: true })
  isCtxUserIdAFollowerOfPostUser?: boolean;

  @Field(() => User, { nullable: true })
  user: User;

  @Field(() => Date, { nullable: true })
  created_at: Date;

  @Field(() => Date, { nullable: true })
  updated_at?: Date;

  @Field(() => Int, { nullable: true })
  comment_count?: number;

  @Field(() => Int, { nullable: false })
  likes_count: number;

  @Field(() => Boolean, { nullable: false })
  currently_liked: boolean;
}
