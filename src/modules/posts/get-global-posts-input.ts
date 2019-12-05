import { Field, Int, ArgsType } from "type-graphql";
import { Min, Max } from "class-validator";

@ArgsType()
export class GetGlobalPostsInput {
  @Field(() => String, { nullable: true })
  cursor?: string;

  @Field(() => Int, { defaultValue: 0, nullable: true })
  @Min(0)
  skip?: number;

  @Field(() => Int, { defaultValue: 15, nullable: true })
  @Min(1)
  @Max(25)
  take?: number;
}
