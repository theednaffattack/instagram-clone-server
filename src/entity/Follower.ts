// import { BaseEntity, Entity, PrimaryGeneratedColumn, ManyToOne } from "typeorm";
// import { Field, ID, ObjectType } from "type-graphql";

// import { User } from "./User";

// @ObjectType()
// @Entity()
// export class Follower extends BaseEntity {
//   @Field(() => ID)
//   @PrimaryGeneratedColumn("uuid")
//   id: string;

//   @Field(() => User)
//   @ManyToOne(() => User, user => user.following)
//   am_follower: User;

//   @Field(() => User)
//   @ManyToOne(() => User, user => user.followers)
//   followed_by: User;
// }
