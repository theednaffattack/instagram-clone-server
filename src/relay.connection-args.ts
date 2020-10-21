import * as Relay from "graphql-relay";
import { ObjectType, Field, ArgsType, ClassType } from "type-graphql";

type ExtractNodeType<EdgeType> = EdgeType extends Relay.Edge<infer NodeType>
  ? NodeType
  : never;

@ArgsType()
export class ConnectionArgs implements Relay.ConnectionArguments {
  @Field(() => String, {
    nullable: true,
    description: "Paginate before opaque cursor",
  })
  before?: Relay.ConnectionCursor;

  @Field(() => String, {
    nullable: true,
    description: "Paginate after opaque cursor",
  })
  after?: Relay.ConnectionCursor;

  @Field(() => Number, { nullable: true, description: "Paginate first" })
  first?: number;

  @Field(() => Number, { nullable: true, description: "Paginate last" })
  last?: number;
}

export function EdgeType<NodeType>(
  nodeName: string,
  nodeType: ClassType<NodeType>
) {
  @ObjectType(`${nodeName}Edge`, { isAbstract: true })
  abstract class Edge implements Relay.Edge<NodeType> {
    @Field(() => nodeType)
    node: NodeType;

    @Field(() => String, {
      description: "Used in `before` and `after` args",
    })
    cursor: Relay.ConnectionCursor;
  }

  return Edge;
}

@ObjectType()
class PageInfoType implements Relay.PageInfo {
  @Field(() => Boolean)
  hasNextPage: boolean;

  @Field(() => Boolean)
  hasPreviousPage: boolean;

  @Field(() => String, { nullable: true })
  startCursor?: Relay.ConnectionCursor;

  @Field(() => String, { nullable: true })
  endCursor?: Relay.ConnectionCursor;
}

export function ConnectionType<
  EdgeType extends Relay.Edge<NodeType>,
  NodeType = ExtractNodeType<EdgeType>
>(nodeName: string, edgeClass: ClassType<EdgeType>) {
  @ObjectType(`${nodeName}Connection`, { isAbstract: true })
  abstract class Connection implements Relay.Connection<NodeType> {
    @Field(() => PageInfoType)
    pageInfo: PageInfoType;

    @Field(() => [edgeClass])
    edges: EdgeType[];
  }

  return Connection;
}
