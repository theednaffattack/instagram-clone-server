import {
  Resolver,
  Query,
  Ctx,
  UseMiddleware,
  ObjectType,
  Field,
  Int,
  Arg,
  InputType
} from "type-graphql";

import { format, parseISO } from "date-fns";

import { PaginatedRelayResponse } from "./paginated-relay-response-type";

import { MyContext } from "../../types/MyContext";
import { Thread } from "../../entity/Thread";
import { isAuth } from "../middleware/isAuth";

// we need to create a temporary class for the abstract, generic class "instance"
@ObjectType()
class ThreadConnection extends PaginatedRelayResponse {
  // you can add more fields here if you need
}

@InputType()
class FeedInput {
  @Field(() => String, { nullable: true })
  cursor?: string;

  @Field(() => Int, { nullable: true })
  take?: number;
}

@Resolver()
export class GetOnlyThreads {
  @UseMiddleware(isAuth)
  @Query(() => ThreadConnection, { nullable: true })
  async getOnlyThreads(
    @Ctx() context: MyContext,
    @Arg("feedinput", () => FeedInput)
    feedinput: FeedInput
  ): Promise<ThreadConnection> {
    const formatDate = (date: any) => format(date, "yyyy-MM-dd HH:mm:ss");

    // export const MoreThanDate = (date: Date) => MoreThan(format(date, 'YYYY-MM-DD HH:MM:SS'))
    // export const LessThanDate = (date: Date) => LessThan(format(date, 'YYYY-MM-DD HH:MM:SS')

    let findThreads = await Thread.createQueryBuilder("thread")
      .loadRelationCountAndMap("thread.message_count", "thread.messages")
      .leftJoinAndSelect("thread.user", "user")
      .leftJoinAndSelect("thread.invitees", "inviteduser")
      .leftJoinAndSelect("thread.invitees", "invitee")
      .where("inviteduser.id = :id", { id: context.userId })
      .andWhere("thread.updated_at <= :cursor::timestamp", {
        cursor: formatDate(
          feedinput.cursor ? parseISO(feedinput.cursor) : new Date()
        )
      })
      // .orderBy("thread.updated_at", "DESC")
      .addOrderBy("thread.updated_at", "DESC")
      .take(feedinput.take)
      .getMany();

    // @TODO: This will have to be changed to hybrid data. Forcing an empty array
    // isn't enough information to handle very many cases
    findThreads && findThreads.length > 0 ? findThreads : (findThreads = []);

    console.log("GETONLYTHREADS REQUEST", findThreads);

    const threadsSelected = findThreads.reverse();

    // let newCursor;
    const newCursor = threadsSelected[0].updated_at
      ? threadsSelected[0].updated_at.toISOString()
      : new Date().toISOString();

    const startCursor = feedinput.cursor
      ? feedinput.cursor
      : new Date().toISOString();

    // BEFORE BOOLEAN
    const beforeThreads = await Thread.createQueryBuilder("thread")
      .leftJoinAndSelect("thread.invitees", "inviteduser")
      .leftJoinAndSelect("thread.invitees", "invitee")
      .where("inviteduser.id = :id", { id: context.userId })
      .andWhere("thread.updated_at <= :cursor::timestamp", {
        cursor: formatDate(parseISO(newCursor))
      })
      // .orderBy("thread.updated_at", "DESC")
      .addOrderBy("thread.updated_at", "DESC")
      .take(feedinput.take)
      .getMany();

    // AFTER  BOOLEAN
    const afterThreads = await Thread.createQueryBuilder("thread")
      .leftJoinAndSelect("thread.invitees", "inviteduser")
      .leftJoinAndSelect("thread.invitees", "invitee")
      .where("inviteduser.id = :id", { id: context.userId })
      .andWhere("thread.updated_at >= :cursor::timestamp", {
        cursor: formatDate(parseISO(startCursor))
      })
      // .orderBy("thread.updated_at", "DESC")
      .addOrderBy("thread.updated_at", "DESC")
      .take(feedinput.take)
      .getMany();

    // console.log({ startCursor, newCursor });
    // console.log({ formattedNewCursor: formatDate(parseISO(newCursor)) });
    // console.log({ formattedStartCursor: formatDate(parseISO(startCursor)) });
    // console.log({ beforeThreads, afterThreads, threadsSelected });

    const myThreadEdges = threadsSelected.map(thread => {
      return {
        node: thread
      };
    });

    let response = {
      edges: myThreadEdges,
      pageInfo: {
        startCursor: startCursor,
        endCursor: newCursor,
        hasNextPage: afterThreads.length > 0 ? true : false,
        hasPreviousPage: beforeThreads.length > 0 ? true : false
      }
    };
    console.log("VIEW RESPONSE", response);
    return response;
  }
}
