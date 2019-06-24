import { ObjectType, Field, ID } from "type-graphql";
import { User } from "../../entity/User";

@ObjectType()
export class MessageSubType {
  // @ts-ignore
  @Field(type => ID)
  id: string;

  @Field({ nullable: true })
  message?: string;

  // @ts-ignore
  @Field(type => String)
  sentBy: string;

  // @ts-ignore
  @Field(type => User)
  user: User;

  // @ts-ignore
  @Field(type => Date, { nullable: true })
  createdAt: Date;

  // @ts-ignore
  @Field(type => Date, { nullable: true })
  updatedAt: Date;
}

export interface MessagePayload {
  id: string;
  message: string;
  createdAt: Date;
  updatedAt: Date;
  sentBy: string;
  user: User;
}
