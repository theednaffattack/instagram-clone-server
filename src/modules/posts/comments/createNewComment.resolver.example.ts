import {
  Resolver,
  Mutation,
  PubSub,
  Arg,
  Args,
  Root,
  Subscription,
  ResolverFilterData,
  Publisher,
  Ctx
} from "type-graphql";

import { CommentInput } from "./comment.input";
import { Comment, CommentSubReturn } from "./comment.type";
import { NewCommentPayload } from "./newComment.interface";
import { MyContext } from "../../../types/MyContext";
import { NewCommentsArgs } from "./recipe.resolver.args";
import { Post } from "../../../entity/Post";
import { Comment as CommentEntity } from "../../../entity/Comment";
import { User } from "../../../entity/User";
// import { Topic } from "./topics";

// import { registerEnum } from "../../type-graphql/RegisterEnum";

// registerEnum(Topic, "NEW_COMMENT", `PubSub topic for Comment creation.`);

@Resolver()
export class CreateNewCommentResolver {
  @Mutation(() => Boolean)
  async addNewComment(
    @Arg("comment") input: CommentInput,
    @Ctx("ctx") ctx: MyContext,
    @PubSub("NEW_COMMENT")
    publishNotifyAboutNewComment: Publisher<NewCommentPayload>
  ): Promise<any> {
    input.postId;
    input.content;

    const getPost = await Post.findOne(input.postId);
    const getUser = await User.findOne(ctx.userId);

    // let inputError = input.content ? "" : "No content was entered";
    // let errorFindUser = getUser ? "" : "Error finding logged in user";
    // let errorFindPost = getPost
    //   ? ""
    //   : "Error retrieving the associated post in the database";

    if (getPost && getUser && input.content) {
      const newComment: Comment = {
        user: getUser,
        post: getPost,
        content: input.content
      };

      const createComment = await CommentEntity.create(newComment).save();

      let forPublishing: NewCommentPayload = {
        postId: createComment.post.id,
        content: createComment.content,
        created_at: createComment.created_at
      };

      await publishNotifyAboutNewComment(forPublishing);

      return true;
    }

    return false;
  }

  @Subscription(() => Comment, {
    topics: "NEW_COMMENT",
    filter: ({
      payload,
      args
    }: ResolverFilterData<NewCommentPayload, NewCommentsArgs>) => {
      return payload.postId === args.postId;
    }
  })
  newComments(
    @Root() newComment: NewCommentPayload,
    // @ts-ignore
    @Args() { postId }: NewCommentsArgs
  ): CommentSubReturn {
    return {
      content: newComment.content,
      created_at: newComment.created_at // limitation of Redis payload serialization
    };
  }
}
