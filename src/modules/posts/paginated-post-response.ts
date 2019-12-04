import { ObjectType, Field } from "type-graphql";

// import { Post } from "../../entity/Post";
import { FollowingPostReturnType } from "../../types/PostReturnTypes";

@ObjectType()
class PostEdge {
  @Field(() => FollowingPostReturnType)
  node: FollowingPostReturnType;
}

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

@ObjectType({ isAbstract: true })
export abstract class PaginatedPostResponse {
  @Field(() => [PostEdge])
  edges: PostEdge[];

  @Field(() => PostPageInfo)
  pageInfo: PostPageInfo;
}
