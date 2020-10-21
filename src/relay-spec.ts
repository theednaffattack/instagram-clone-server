import { ObjectType, Field, ID } from "type-graphql";
import { CreateDateColumn, UpdateDateColumn } from "typeorm";

@ObjectType()
class IdAndDates {
  @Field(() => ID)
  id: string;

  @Field(() => Date, { nullable: true })
  @CreateDateColumn({ type: "timestamp" })
  created_at: Date;

  @Field(() => Date, { nullable: true })
  @UpdateDateColumn({ type: "timestamp" })
  updated_at: Date;
}

@ObjectType()
export class PostType extends IdAndDates {
  @Field(() => String)
  name: string;

  // @Field(() => String)
  // email: string;

  // @Field(() => Boolean)
  // emailVerified: boolean;
}
