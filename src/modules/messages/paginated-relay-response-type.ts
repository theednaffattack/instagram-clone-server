import { ObjectType, Field } from "type-graphql";
import { Thread } from "../../entity/Thread";
import { Message } from "../../entity/Message";

// export default function PaginatedRelayResponse<TItem>(
//   TItemClass: ClassType<TItem>
// ) {
//   // `isAbstract` decorator option is mandatory to prevent registering in schema
//   @ObjectType({ isAbstract: true })
//   abstract class PaginatedRelayResponseClass {
//     @Field(() => [ThreadEdge])
//     edges: ThreadEdge[];

//     @Field(() => MyPageInfo)
//     pageInfo: MyPageInfo;
//   }
//   return PaginatedRelayResponseClass;
// }

// @Field(() => Int)
// total: number;

// @Field()
// hasMore: boolean;

@ObjectType()
class ThreadEdge {
  // @Field(() => String)
  // cursor: string;

  @Field(() => Thread)
  node: Thread;
}

@ObjectType()
class MessageEdge {
  @Field(() => String)
  cursor: string;

  @Field(() => Message)
  node: Message;
}

@ObjectType()
class PageInfo {
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
export abstract class PaginatedRelayResponse {
  @Field(() => [ThreadEdge])
  edges: ThreadEdge[];

  @Field(() => PageInfo)
  pageInfo: PageInfo;
}

@ObjectType({ isAbstract: true })
export abstract class PaginatedRelayMessageResponse {
  @Field(() => [MessageEdge])
  edges: MessageEdge[];

  @Field(() => PageInfo)
  pageInfo: PageInfo;
}
