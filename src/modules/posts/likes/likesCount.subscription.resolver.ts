import {
  Resolver,
  ResolverFilterData,
  Subscription,
  InputType,
  Field,
  ID,
  ObjectType,
  Int,
  Root,
  Arg
} from "type-graphql";

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
      if (payload && args.input) {
        return payload.postId === args.input.postId;
      } else {
        return false;
      }
    }
  })
  async likesCount(
    @Root() likesCountPayload: LikesCountType,
    // @ts-ignore
    @Arg("input") input: LikesCountArgs
  ): Promise<LikesCountType> {
    if (!likesCountPayload) {
      // if the payload doesn't exist (meaning nothing was published)
      // that means it's executing this on startup. Publish an
      // obviously fake number
      return { count: -3, postId: input.postId };
    }
    return {
      count: likesCountPayload && likesCountPayload.count,
      postId: input.postId
    };
    // // @ts-ignore
    // let [data, count] = await Like.findAndCount({
    //   where: { post: { id: input.postId } }
    // });
    // let returnCount =
    //   likesCountPayload && likesCountPayload.count
    //     ? likesCountPayload.count
    //     : -1;
    // return { count: returnCount, postId: input.postId };
  }
}
