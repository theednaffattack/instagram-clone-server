import { Length } from "class-validator";
import { GraphQLUpload } from "graphql-upload";
import { Field, InputType, ID } from "type-graphql";

import { Upload } from "../../../types/Upload";

@InputType()
export class PostInput {
  @Field()
  @Length(1, 255)
  text: string;

  @Field({ nullable: true })
  @Length(1, 255)
  title?: string;

  @Field(() => ID)
  user: string;

  @Field(() => [String], { nullable: "itemsAndList" })
  images: string[];

  @Field(() => GraphQLUpload)
  picture: Upload;
}
