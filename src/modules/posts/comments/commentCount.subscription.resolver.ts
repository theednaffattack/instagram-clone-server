import {
  Resolver,
  ResolverFilterData,
  // Root,
  Subscription,
  Arg,
  InputType,
  Field,
  ID
} from "type-graphql";

import { CommentCountType } from "./createNewComment.resolver";
import { Comment } from "../../../entity/Comment";

@InputType()
export class CommentCountArgs {
  @Field(() => ID)
  postId: string;
}

@Resolver()
export class CommentCountResolver {
  @Subscription(() => CommentCountType, {
    topics: ({ context }: any) => {
      if (!context.userId) {
        throw new Error("Not authorized for this topic");
      }

      return ["NEW_COMMENT", "COUNT_COMMENT"];
    },

    filter: ({ payload, args }: ResolverFilterData<CommentCountType, any>) => {
      return payload.postId === args.input.postId;
    }
  })
  async commentCount(
    // @Root() commentCountPayload: CommentCountType,
    @Arg("input") input: CommentCountArgs
  ): Promise<CommentCountType> {
    // @ts-ignore
    let [data, count] = await Comment.findAndCount({
      where: { post: { id: input.postId } }
    });

    return { count, postId: input.postId };
  }
}
