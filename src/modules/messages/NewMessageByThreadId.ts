import { Subscription, Root, Resolver, Arg } from "type-graphql";
import { inspect } from "util";

import { IAddMessagePayload, AddMessagePayload } from "./AddMessageToThreads";
import { AddMessageToThreadInput_v2 } from "./MessageThreadInput";

interface NewMessageByThreadIdPayload extends IAddMessagePayload {}

// interface NewMessageByThreadIdArgs {}

// interface IMessagesByThreadUI extends NewMessageByThreadIdPayload {
//   date: Date;
// }

interface IUtilOptions {
  showHidden?: boolean;
  depth?: number;
  colors?: boolean;
}

function clog(
  someArgs: any,
  options: IUtilOptions = { showHidden: true, depth: 3, colors: true }
) {
  if (options) {
    console.log("options", { ...options });
  }
  console.log(inspect(someArgs, options));
}

@Resolver()
export class NewMessageByThreadIdResolver {
  // ...
  @Subscription(() => AddMessagePayload, {
    topics: "MESSAGES",
    filter: ({ args, context, payload }) => {
      clog(
        { args, context, payload },
        { showHidden: true, depth: 3, colors: true }
      );

      const messageMatchesThread = args.data.threadId === payload.threadId;

      if (messageMatchesThread) {
        return true;
      } else {
        return false;
      }
      // return args.priorities.includes(payload.priority);
    }
  })
  newMessageByThreadId(
    @Root() NewMessageByThreadIdPayload: NewMessageByThreadIdPayload,
    // @Args() args: NewMessageByThreadIdArgs
    @Arg("data", () => AddMessageToThreadInput_v2)
    input: // @ts-ignore
    AddMessageToThreadInput_v2
  ): NewMessageByThreadIdPayload {
    clog(input);
    return {
      ...NewMessageByThreadIdPayload
    };
  }
}
