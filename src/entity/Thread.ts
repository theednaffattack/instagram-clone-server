import {
  BaseEntity,
  Entity,
  PrimaryGeneratedColumn,
  OneToMany,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
  Column
} from "typeorm";
import { Field, ID, ObjectType, Int } from "type-graphql";

import { User } from "./User";
import { Message } from "./Message";

@ObjectType()
@Entity()
export class Thread extends BaseEntity {
  @Field(() => ID, { nullable: true })
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Field(() => [Message], { nullable: "itemsAndList" })
  @OneToMany(() => Message, message => message.thread)
  messages?: Message[];

  @Field(() => String, { nullable: true })
  @Column({ nullable: true })
  last_message?: string;

  @Field(() => Int)
  message_count?: number;

  @Field(() => User, { nullable: false })
  @ManyToOne(() => User, user => user.threads)
  user: User;

  @Field(() => [User], { nullable: false })
  @ManyToMany(() => User, user => user.thread_invitations)
  invitees: User[];

  @Field(() => Date, { nullable: true })
  @CreateDateColumn({ type: "timestamp" })
  created_at: Date;

  @Field(() => Date, { nullable: true })
  @UpdateDateColumn({ type: "timestamp", nullable: true })
  updated_at?: Date;
}

// @ObjectType()
// export class PostSubType {
//   // @ts-ignore
//   @Field(type => ID)
//   id: string;

//   // @ts-ignore
//   @Field(type => String)
//   title: string;

//   // @ts-ignore
//   @Field(type => String)
//   text: string;

//   // @ts-ignore
//   @Field(type => [Image])
//   images: Image[];

//   // @ts-ignore
//   @Field(type => User)
//   user: User;

//   // @ts-ignore
//   @Field(type => Date)
//   created_at: Date;

//   // @ts-ignore
//   @Field(type => Date)
//   updated_at?: Date;
// }
