import {
  BaseEntity,
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn
} from "typeorm";
import { Field, ID, ObjectType } from "type-graphql";
import { Image } from "./Image";
import { User } from "./User";

@ObjectType()
@Entity()
export class Post extends BaseEntity {
  @Field(() => ID, { nullable: true })
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  title: string;

  @Field({ nullable: true })
  @Column()
  text: string;

  @Field(() => [Image], { nullable: true })
  @OneToMany(() => Image, image => image.post)
  images: Image[];

  @Field(() => Boolean, { nullable: true })
  isCtxUserIdAFollowerOfPostUser: boolean;

  @Field(() => User, { nullable: true })
  @ManyToOne(() => User, user => user.posts)
  user: User;

  @Field(() => Date, { nullable: true })
  @CreateDateColumn({ type: "timestamp" })
  created_at: Date;

  @Field(() => Date, { nullable: true })
  @UpdateDateColumn({ type: "timestamp", nullable: true })
  updated_at?: Date;
}
