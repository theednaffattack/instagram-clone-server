import {
  BaseEntity,
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
  Column,
} from "typeorm";
import { Field, ID, ObjectType } from "type-graphql";

import { Post } from "./Post";
import { User } from "./User";

@ObjectType()
@Entity()
export class Comment extends BaseEntity {
  @Field(() => ID)
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Field(() => ID)
  @Column()
  postId: string;

  @Field(() => Post)
  @ManyToOne(
    () => Post,
    (post) => post.comments
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

  @Field(() => Date, { nullable: true })
  @CreateDateColumn({ type: "timestamp" })
  created_at: string; // limitation of Redis payload serialization

  @Field(() => String)
  @Column({ nullable: false })
  content: string;
}
