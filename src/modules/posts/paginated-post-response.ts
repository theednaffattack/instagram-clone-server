import { ObjectType, Field } from "type-graphql";

// import { Post } from "../../entity/Post";
// import { FollowingPostReturnType } from "../../types/PostReturnTypes";
import { Post } from "src/entity/Post";

// @ObjectType()
// class PostEdge {
//   @Field(() => FollowingPostReturnType)
//   node: FollowingPostReturnType;
// }

@ObjectType()
class PostPageInfo {
  @Field(() => String)
  startCursor: string;

  @Field(() => String)
  endCursor: string;

  @Field(() => Boolean)
  hasNextPage: boolean;

  @Field(() => Boolean)
  hasPreviousPage: boolean;
}

@ObjectType()
export class PostReturnType extends Post {
  // @Field(() => Boolean, { nullable: true })
  // isCtxUserIdAFollowerOfPostUser: boolean;
  // @Field(() => Int, { nullable: false })
  // comments_count: number;
  // @Field(() => Int, { nullable: false })
  // likes_count: number;
  // @Field(() => Boolean, { nullable: false })
  // currently_liked: boolean;
  // @Field(() => PostPageInfo)
  // pageInfo: PostPageInfo;
}

@ObjectType({ isAbstract: true })
export abstract class PaginatedPostResponse {
  @Field(() => [PostReturnType])
  posts: PostReturnType[];

  @Field(() => PostPageInfo)
  pageInfo: PostPageInfo;
}
