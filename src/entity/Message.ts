import { ObjectType, Field, ID } from "type-graphql";
import {
  ManyToOne,
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BaseEntity,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany
} from "typeorm";

import { User } from "./User";
import { Thread } from "./Thread";
import { Image } from "./Image";
// import { Hotel } from "./Hotel";

export interface MessagePayload {
  id: number;
  message?: string;
  created_at?: Date;
  updated_at?: Date;
  sentBy?: string;
  user?: User;
}

@ObjectType()
@Entity()
export class Message extends BaseEntity {
  @Field(() => ID)
  @PrimaryGeneratedColumn("uuid")
  id: string;

  // // @ts-ignore
  // @Field(type => Date)
  // @Column()
  // createdAt: Date;

  // // @ts-ignore
  // @Field(type => Date)
  // @Column()
  // updatedAt: Date;

  @Field(() => Date, { nullable: true })
  @CreateDateColumn({ type: "timestamp" })
  created_at: Date;

  @Field(() => Date, { nullable: true })
  @UpdateDateColumn({ type: "timestamp", nullable: true })
  updated_at?: Date;

  // @ts-ignore
  @Field()
  @Column()
  message: string;

  mappedMessages: [User];

  @Field(() => [Image], { nullable: "itemsAndList" })
  @OneToMany(() => Image, image => image.message, { nullable: true })
  images: Image[];

  // @ts-ignore
  @Field(type => User)
  // @Column({ nullable: true })
  @ManyToOne(() => User, user => user.sent_messages, { cascade: true })
  sentBy: User;

  // @ts-ignore
  @Field(type => User)
  @ManyToOne(() => User, user => user.messages, { cascade: true })
  user: User;

  @Field(() => Thread, { nullable: true })
  @ManyToOne(() => Thread, thread => thread.messages)
  thread: Thread;
}
