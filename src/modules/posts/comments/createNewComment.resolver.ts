import {
  Arg,
  Ctx,
  Field,
  ID,
  InputType,
  Mutation,
  ObjectType,
  Publisher,
  PubSub,
  Resolver,
  ResolverFilterData,
  Root,
  Subscription
} from "type-graphql";

import { MyContext } from "../../../types/MyContext";
import { Post } from "../../../entity/Post";
import { User } from "../../../entity/User";
import { Comment as CommentEntity } from "../../../entity/Comment";
import { Comment } from "./comment.type";

@ObjectType()
export class AddCommentPayloadType {
  @Field(() => ID)
  id: string;

  // @ts-ignore
  @Field(type => ID)
  postId: string;

  // @ts-ignore
  @Field(type => ID)
  userId: string;

  @Field(() => String, { nullable: true })
  created_at: string; // limitation of Redis payload serialization

  @Field(() => String)
  content: string;
}

@InputType()
export class NewCommentsArgs {
  @Field(() => ID)
  postId: string;

  @Field(() => String)
  content: string;
}

@Resolver()
export class AddCommentToPost {
  @Subscription(() => AddCommentPayloadType, {
    topics: ({ context }: any) => {
      if (!context.userId) {
        throw new Error("Not authorized for this topic");
      }

      return "NEW_COMMENT";
    },

    filter: ({
      payload,
      args
    }: ResolverFilterData<AddCommentPayloadType, any>) => {
      console.log("view paylod and args inside subs filter", {
        payload: payload,
        input: args
      });
      // @ts-ignore
      return payload.postId === args.input.postId;
    }
  })
  newComment(
    @Root() commentPayload: AddCommentPayloadType,
    // @ts-ignore
    @Arg("input") input: NewCommentsArgs
  ): AddCommentPayloadType {
    return commentPayload;
  }

  @Mutation(() => AddCommentPayloadType)
  async addCommentToPost(
    @Ctx() ctx: MyContext,
    @Arg("input") input: NewCommentsArgs,
    @PubSub("NEW_COMMENT") publishComment: Publisher<AddCommentPayloadType>
  ): Promise<AddCommentPayloadType> {
    input.postId;
    input.content;

    const getPost = await Post.findOne(input.postId);
    const getUser = await User.findOne(ctx.userId);

    if (getPost && getUser && input.content) {
      const newComment: Comment = {
        user: getUser,
        post: getPost,
        content: input.content
      };

      const createComment = await CommentEntity.create(newComment).save();

      let forPublishing: AddCommentPayloadType = {
        id: createComment.id,
        content: createComment.content,
        created_at: createComment.created_at,
        postId: createComment.post.id,
        userId: createComment.user.id
      };

      await publishComment(forPublishing);

      return forPublishing;
    } else {
      throw new Error("Error posting comment!");
    }
  }
}
