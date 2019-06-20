import {
  BaseEntity,
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne
  // OneToMany
} from "typeorm";
import { Field, ID, ObjectType } from "type-graphql";

import { Post } from "./Post";
import { User } from "./User";

@ObjectType()
@Entity()
export class Image extends BaseEntity {
  @Field(() => ID)
  @PrimaryGeneratedColumn("uuid")
  id: string;

  // @Field()
  // @Column()
  // title: string;

  // @Field()
  // @Column()
  // text: string;

  @Field()
  @Column()
  uri: string;

  // @ts-ignore
  @Field(type => Post)
  @ManyToOne(() => Post, post => post.images)
  post: Post;

  // @ts-ignore
  @Field(type => User)
  @ManyToOne(() => User, user => user.images)
  user: User;
}
