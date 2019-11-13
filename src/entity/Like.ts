import { BaseEntity, Entity, PrimaryGeneratedColumn, ManyToOne } from "typeorm";
import { Field, ID, ObjectType, Int } from "type-graphql";

import { Post } from "./Post";
import { User } from "./User";

@ObjectType()
@Entity()
export class Like extends BaseEntity {
  @Field(() => ID)
  @PrimaryGeneratedColumn("uuid")
  id: string;

  // @ts-ignore
  @Field(type => Post)
  @ManyToOne(() => Post, post => post.likes)
  post: Post;

  // @ts-ignore
  @Field(type => User)
  @ManyToOne(() => User, user => user.likes)
  user: User;

  @Field(() => Int, { nullable: false })
  count: number;
}
