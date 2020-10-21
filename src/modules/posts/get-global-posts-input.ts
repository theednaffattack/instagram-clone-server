import { Field, Int, ArgsType } from "type-graphql";
import { Min, Max } from "class-validator";

@ArgsType()
export class GetGlobalPostsInput {
  @Field(() => String, {
    nullable: true,
    description:
      "Cursor represented as an ISO 8601 Date String. For global posts items OLDER than the cursor are returned.",
  })
  cursor?: string;

  @Field(() => Int, {
    defaultValue: 0,
    nullable: true,
    description:
      "The number of records to skip (offset). Not recommended if using cursor.",
  })
  @Min(0)
  skip?: number;

  @Field(() => Int, { defaultValue: 15, nullable: true })
  @Min(1)
  @Max(25)
  take?: number;
}
