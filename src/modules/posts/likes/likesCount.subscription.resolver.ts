import {
  Resolver,
  ResolverFilterData,
  // Root,
  Subscription,
  Arg,
  InputType,
  Field,
  ID,
  ObjectType,
  Int,
  Root
} from "type-graphql";

import { Like } from "../../../entity/Like";
// import { LikeStatus } from "./updateLikes.resolver";

@ObjectType()
export class LikesCountType {
  @Field(() => Int)
  count: number;

  @Field(() => ID)
  postId: string;
}

@InputType()
export class LikesCountArgs {
  @Field(() => ID)
  postId: string;
}

@Resolver()
export class LikesCountResolver {
  @Subscription(() => LikesCountType, {
    topics: ({ context }: any) => {
      if (!context.userId) {
        throw new Error("Not authorized for this topic");
      }

      return "COUNT_UPDATED";
    },

    filter: ({ payload, args }: ResolverFilterData<LikesCountType, any>) => {
      // @ts-ignore
      return payload.postId === args.input.postId;
    }
  })
  async likesCount(
    @Root() likesCountPayload: LikesCountType,
    @Arg("input") input: LikesCountArgs
  ): Promise<LikesCountType> {
    // @ts-ignore
    let [data, count] = await Like.findAndCount({
      where: { post: { id: input.postId } }
    });
    let returnCount =
      likesCountPayload && likesCountPayload.count
        ? likesCountPayload.count
        : -1;
    return { count: returnCount, postId: input.postId };
  }
}
