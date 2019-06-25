import {
  BaseEntity,
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToOne
} from "typeorm";
import { Field, ID, ObjectType } from "type-graphql";
import { Image } from "./Image";
import { User } from "./User";

@ObjectType()
@Entity()
export class Post extends BaseEntity {
  @Field(() => ID)
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  title: string;

  @Field()
  @Column()
  text: string;

  @Field(() => [Image], { nullable: true })
  @OneToMany(() => Image, image => image.post)
  images: Image[];

  @Field(() => User)
  @ManyToOne(() => User, user => user.posts)
  user: User;
}

@ObjectType()
export class PostSubType {
  // @ts-ignore
  @Field(type => ID)
  id: string;

  // @ts-ignore
  @Field(type => String)
  title: string;

  // @ts-ignore
  @Field(type => String)
  text: string;

  // @ts-ignore
  @Field(type => [Image])
  images: Image[];

  // @ts-ignore
  @Field(type => User)
  user: User;
}
