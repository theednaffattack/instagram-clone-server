import { ObjectType, Field, ID } from "type-graphql";
import { User } from "../../entity/User";

@ObjectType()
export class MessageSubType {
  // @ts-ignore
  @Field(type => ID)
  id: string;

  // @ts-ignore
  @Field(type => String, { nullable: true })
  message?: string;

  // @ts-ignore
  @Field(type => User)
  sentBy: User;

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
