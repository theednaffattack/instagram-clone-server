import { Field, ObjectType, ArgsType, InputType, ID } from "type-graphql";
import { GraphQLUpload } from "apollo-server-core";
import { Upload } from "../../types/Upload";
// import { Photo } from "src/entity/Photo";
// import { Photo } from "../../entity/Photo";

@ArgsType()
export class CreateMessageThreadAndMessageInput {
  // @ts-ignore
  @Field(type => String)
  sentTo: string;

  // @ts-ignore
  @Field(type => String)
  message: string;

  @Field(() => [GraphQLUpload], { nullable: "itemsAndList" })
  images?: Upload[];
}

@ArgsType()
export class AddMessageToThreadInput {
  // @ts-ignore
  @Field(type => ID)
  threadId: string;

  // @ts-ignore
  @Field(type => String)
  sentTo: string;

  // @ts-ignore
  @Field(type => String)
  message: string;

  @Field(() => [GraphQLUpload], { nullable: "itemsAndList" })
  images?: Upload[];
}

@InputType()
export class AddMessageToThreadInput_v2 {
  // @ts-ignore
  @Field(type => ID)
  threadId: string;

  // @ts-ignore
  @Field(type => String)
  sentTo: string;

  // @ts-ignore
  @Field(type => String)
  message: string;

  @Field(() => [GraphQLUpload], { nullable: "itemsAndList" })
  images?: Upload[];
}

@InputType()
export class GetMessageThreadsFromUserInput {
  // @ts-ignore
  @Field(type => String)
  sentBy: string;
  // @ts-ignore
  @Field(type => String)
  user: string;
}

@InputType()
export class GetAllMyMessageThreadsInput {
  // @ts-ignore
  @Field(type => String)
  user: string;
}

@ObjectType()
export class MessageThreadOutput {
  @Field()
  message: string;
}
