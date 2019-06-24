import {
  BaseEntity,
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToOne
} from "typeorm";
import { Field, ID, ObjectType, Root } from "type-graphql";

import { Post } from "./Post";
import { Image } from "./Image";
import { Message } from "./Message";
// import { Follower } from "./Follower";

@ObjectType()
@Entity()
export class User extends BaseEntity {
  @Field(() => ID)
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Field()
  @Column()
  firstName: string;

  @Field()
  @Column()
  lastName: string;

  @Field()
  @Column("text", { unique: true })
  email: string;

  @Field()
  name(@Root() parent: User): string {
    return `${parent.firstName} ${parent.lastName}`;
  }

  @Column()
  password: string;

  // @ts-ignore
  @Field(type => Boolean)
  @Column("bool", { default: false })
  confirmed: boolean;

  // @ts-ignore
  @Field(type => Post, { nullable: true })
  @OneToMany(() => Post, post => post.user)
  posts?: Post[];

  // @ts-ignore
  @Field(type => Image, { nullable: true })
  @OneToMany(() => Image, image => image.user, { nullable: true })
  images: Image[];

  // @ts-ignore
  @Field(type => [Message], { nullable: true })
  @OneToMany(() => Message, message => message.user)
  messages?: Message[];

  // @ts-ignore
  @Field(type => User)
  // @ts-ignore
  @ManyToOne(type => User, user => user.am_follower)
  followed_by: User;

  // @ts-ignore
  @Field(type => User)
  // @ts-ignore
  @OneToMany(type => User, user => user.followed_by)
  am_follower: User[];
}
