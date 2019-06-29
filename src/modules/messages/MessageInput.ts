import { Field, ObjectType, ArgsType, InputType } from "type-graphql";
// import { Photo } from "src/entity/Photo";
// import { Photo } from "../../entity/Photo";

@ArgsType()
export class MessageFromUserInput {
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

@InputType()
export class GetMessagesFromUserInput {
  // @ts-ignore
  @Field(type => String)
  sentBy: string;
  // @ts-ignore
  @Field(type => String)
  user: string;
}

@InputType()
export class GetAllMyMessagesInput {
  // @ts-ignore
  @Field(type => String)
  user: string;
}

@ObjectType()
export class MessageOutput {
  @Field()
  message: string;
}
