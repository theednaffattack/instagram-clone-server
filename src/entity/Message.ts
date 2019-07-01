import { ObjectType, Field, ID } from "type-graphql";
import {
  ManyToOne,
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BaseEntity
} from "typeorm";

import { User } from "./User";
// import { Hotel } from "./Hotel";

export interface MessagePayload {
  id: number;
  message?: string;
  createdAt?: Date;
  updatedAt?: Date;
  sentBy?: string;
  user?: User;
}

@ObjectType()
@Entity()
export class Message extends BaseEntity {
  @Field(() => ID)
  @PrimaryGeneratedColumn("uuid")
  id: string;

  // @ts-ignore
  @Field(type => Date)
  @Column()
  createdAt: Date;

  // @ts-ignore
  @Field(type => Date)
  @Column()
  updatedAt: Date;

  // @ts-ignore
  @Field()
  @Column()
  message: string;

  mappedMessages: [User];

  // @ts-ignore
  @Field(type => User)
  // @Column({ nullable: true })
  @ManyToOne(() => User, user => user.sent_messages, { cascade: true })
  sentBy: User;

  // @ts-ignore
  @Field(type => User)
  @ManyToOne(() => User, user => user.messages, { cascade: true })
  user: User;
}
