import {
  BaseEntity,
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToMany,
  JoinTable
  // RelationCount
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
  @Field(type => Image, { nullable: true })
  @Column("varchar", { nullable: true })
  profileImgUrl: string;

  // @ts-ignore
  @Field(type => [Message], { nullable: true })
  @OneToMany(() => Message, message => message.user)
  messages?: Message[];

  // @ts-ignore
  @Field(type => [Message], { nullable: true })
  @OneToMany(() => Message, message => message.sentBy)
  sent_messages: Message[];

  // @ts-ignore
  @Field(type => [User], { nullable: "itemsAndList" })
  // @ts-ignore
  @ManyToMany(type => User, user => user.following, { nullable: true })
  @JoinTable()
  followers: User[];

  // @ts-ignore
  @Field(type => [User], { nullable: "itemsAndList" })
  // @ts-ignore
  @ManyToMany(type => User, user => user.followers, { nullable: true })
  following: User[];

  // @RelationCount((user: User) => user.followers)
  // followersCount: number;

  // @RelationCount((user: User) => user.following)
  // followingCount: number;
}
