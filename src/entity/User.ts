import {
  BaseEntity,
  Entity,
  PrimaryGeneratedColumn,
  Column,
  // ManyToOne,
  OneToMany
} from "typeorm";
import { Field, ID, ObjectType, Root } from "type-graphql";
import { Post } from "./Post";
import { Image } from "./Image";

@ObjectType()
@Entity()
export class User extends BaseEntity {
  @Field(() => ID)
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Field()
  @Column()
  firstName: string;

  @Field()
  @Column()
  lastName: string;

  @Field()
  @Column("text", { unique: true })
  email: string;

  @Field()
  name(@Root() parent: User): string {
    return `${parent.firstName} ${parent.lastName}`;
  }

  @Column()
  password: string;

  // @ts-ignore
  @Field(type => Boolean)
  @Column("bool", { default: false })
  confirmed: boolean;

  // @ts-ignore
  @Field(type => Post, { nullable: true })
  @OneToMany(() => Post, post => post.user)
  posts?: Post[];

  // // @ts-ignore
  // @Field(type => [Image], { nullable: true })
  // @ManyToOne(() => Image, image => image.user)
  // images: Image[];

  // @ts-ignore
  @Field(type => Image)
  @OneToMany(() => Image, image => image.user)
  images: Image[];
}
