import {
  BaseEntity,
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  Column,
} from "typeorm";
import { Field, ID, ObjectType, Int } from "type-graphql";

import { Post } from "./Post";
import { User } from "./User";

@ObjectType()
@Entity()
export class Like extends BaseEntity {
  @Field(() => ID)
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Field(() => ID)
  @Column()
  postId: string;

  @Field(() => Post)
  @ManyToOne(
    () => Post,
    (post) => post.likes
  )
  post: Post;

  @Field(() => ID)
  @Column()
  userId: string;

  @Field(() => User)
  @ManyToOne(
    () => User,
    (user) => user.likes
  )
  user: User;

  @Field(() => Int, { nullable: false })
  count: number;
}
