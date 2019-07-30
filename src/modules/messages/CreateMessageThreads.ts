import { Args, Resolver, Ctx, Mutation, UseMiddleware } from "type-graphql";

import { CreateMessageThreadAndMessageInput } from "./MessageThreadInput";
import { MyContext } from "../../types/MyContext";
import { Thread } from "../../entity/Thread";
import { Message } from "../../entity/Message";
import { User } from "../../entity/User";
import { Image } from "../../entity/Image";
import { isAuth } from "../middleware/isAuth";

@Resolver()
export class CreateMessageThreadResolver {
  @UseMiddleware(isAuth)
  @Mutation(() => Thread)
  async createMessageThread(
    @Ctx() context: MyContext,
    // @ts-ignore
    @Args(type => CreateMessageThreadAndMessageInput)
    input: CreateMessageThreadAndMessageInput
  ) {
    const sentBy = await User.findOne(context.userId);

    const collectInvitees: any[] = [];

    const invitees = await Promise.all(
      input.invitees.map(async person => {
        let tempPerson = await User.findOne(person);
        collectInvitees.push(tempPerson);
        return tempPerson;
      })
    );

    const receiver = await User.findOne(input.sentTo);

    let newThread;

    const lastImage =
      input.images && input.images.length > 0 ? input.images.length - 1 : 0;

    // if we have the user sending and receiving and if there IS AN IMAGE(S)
    if (
      sentBy &&
      receiver &&
      input.images &&
      input.images[lastImage] &&
      invitees.length > 0
    ) {
      // if there are images save them. if not make the message without it
      const { filename } = await input.images[lastImage];

      let imageName = `${filename}.png`;

      // let localImageUrl = `/../../../public/tmp/images/${imageName}`;

      let publicImageUrl = `https://eddie-faux-gram.s3.amazonaws.com/${imageName}`;

      // await new Promise((resolve, reject) => {
      //   createReadStream()
      //     .pipe(createWriteStream(__dirname + localImageUrl))
      //     .on("finish", () => {
      //       resolve(true);
      //     })
      //     .on("error", () => {
      //       reject(false);
      //     });
      // });

      let newImage = await Image.create({
        uri: publicImageUrl,
        //@ts-ignore
        user: context.userId
      }).save();

      let createMessage = {
        message: input.message,
        user: receiver,
        sentBy,
        images: [newImage]
      };

      // CREATING rather than REPLYING to message...
      const newMessage = await Message.create(createMessage).save();

      newImage.message = newMessage;

      let createThread = {
        user: sentBy,
        invitees: [sentBy, receiver, ...collectInvitees],
        messages: [newMessage]
      };

      newThread = await Thread.create(createThread)
        .save()
        .catch((error: any) => error);

      return newThread;
    }

    // if we have the user sending and receiving and if there IS NOT AN IMAGE
    if ((sentBy && receiver && !input.images) || !input.images![lastImage]) {
      let createMessage = {
        message: input.message,
        user: receiver,
        sentBy
      };

      const newMessage = await Message.create(createMessage).save();

      let createThread = {
        user: sentBy,
        invitees: [sentBy, receiver, ...collectInvitees],
        messages: [newMessage]
      };

      // @ts-ignore
      newThread = await Thread.create(createThread)
        .save()
        .catch((error: any) => error);

      return newThread;
    } else {
      throw Error(
        `unable to find sender or receiver\nsender: ${sentBy}\nreceiver: ${receiver}`
      );
    }
  }
}
