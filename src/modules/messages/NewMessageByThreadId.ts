import { Subscription, Root, Resolver } from "type-graphql";

import { IAddMessagePayload, AddMessagePayload } from "./AddMessageToThreads";

interface NewMessageByThreadIdPayload extends IAddMessagePayload {}

@Resolver()
export class NewMessageByThreadIdResolver {
  // ...
  @Subscription(() => AddMessagePayload, {
    topics: "MESSAGES",
    filter: ({ args, payload }) => {
      const messageMatchesThread = args.data.threadId === payload.threadId;

      if (messageMatchesThread) {
        return true;
      } else {
        return false;
      }
    }
  })
  newMessageByThreadId(
    @Root() NewMessageByThreadIdPayload: NewMessageByThreadIdPayload
  ): NewMessageByThreadIdPayload {
    return {
      ...NewMessageByThreadIdPayload
    };
  }
}
