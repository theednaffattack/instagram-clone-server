import { Field, ObjectType, ArgsType, InputType, ID } from "type-graphql";
// import { Photo } from "src/entity/Photo";
// import { Photo } from "../../entity/Photo";

@ArgsType()
export class MessageThreadFromUserInput {
  // @ts-ignore
  @Field(type => String)
  sentTo: string;
  // @ts-ignore
  // @Field(type => String)
  // sentBy: string;
  // @ts-ignore
  @Field(type => String)
  message: string;
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
