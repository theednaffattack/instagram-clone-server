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

  @OneToMany(() => Image, image => image.post)
  images: Image[];

  @ManyToOne(() => User, user => user.posts)
  user: User;
}
