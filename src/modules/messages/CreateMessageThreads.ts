import { Args, Resolver, Ctx, Mutation } from "type-graphql";
import { createWriteStream } from "fs";

import { CreateMessageThreadAndMessageInput } from "./MessageThreadInput";
import { MyContext } from "../../types/MyContext";
import { Thread } from "../../entity/Thread";
import { Message } from "../../entity/Message";
import { User } from "../../entity/User";
import { Image } from "../../entity/Image";

@Resolver()
export class CreateMessageThreadResolver {
  // @ts-ignore
  @Mutation(type => Thread)
  async createMessageThread(
    @Ctx() context: MyContext,
    // @ts-ignore
    @Args(type => CreateMessageThreadAndMessageInput)
    input: CreateMessageThreadAndMessageInput
  ) {
    console.log("input\n".toUpperCase(), input);

    const sentBy = await User.findOne(context.userId);

    const receiver = await User.findOne(input.sentTo);

    // let createMessage;

    let newThread;

    const lastImage =
      input.images && input.images.length > 0 ? input.images.length - 1 : 0;

    console.log(sentBy && receiver && input.images && input.images[lastImage]);

    // if we have the user sending and receiving and if there IS AN IMAGE(S)
    if (sentBy && receiver && input.images && input.images[lastImage]) {
      console.log("THERE IS AN IMAGE");
      // if there are images save them. if not make the message without it
      const { filename, createReadStream } = await input.images[lastImage];

      let imageUrl = `/../../../public/tmp/images/${filename}.png`;

      let imageName = `${filename}.png`;

      let localImageUrl = `/../../../public/tmp/images/${imageName}`;

      let publicImageUrl = `http://192.168.1.10:4000/temp/${imageName}`;

      let savedFile = await new Promise((resolve, reject) => {
        createReadStream()
          .pipe(createWriteStream(__dirname + localImageUrl))
          .on("finish", () => {
            resolve(true);
          })
          .on("error", () => {
            reject(false);
          });
      });

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

      console.log("filename", JSON.stringify({ filename, imageUrl }, null, 2));
      console.log("savedFile", { savedFile });

      // CREATING rather than REPLYING to message...
      const newMessage = await Message.create(createMessage).save();

      newImage.message = newMessage;

      // let mySavedImage = await newImage.save();

      // console.log("VIEW IMAGE INFO", { images: mySavedImage });

      let createThread = {
        user: sentBy,
        invitees: [sentBy, receiver],
        messages: [newMessage]
      };

      newThread = await Thread.create(createThread)
        .save()
        .catch(error => error);

      console.log("newThread", JSON.stringify(newThread, null, 2));

      return newThread;
    }

    // if we have the user sending and receiving and if there IS NOT AN IMAGE
    if ((sentBy && receiver && !input.images) || !input.images![lastImage]) {
      console.log("THERE IS ***NOT*** AN IMAGE");

      let createMessage = {
        message: input.message,
        user: receiver,
        sentBy
      };

      const newMessage = await Message.create(createMessage).save();

      let createThread = {
        user: sentBy,
        invitees: [sentBy, receiver],
        messages: [newMessage]
      };

      // @ts-ignore
      newThread = await Thread.create(createThread)
        .save()
        .catch((error: any) => error);

      console.log("newThread", newThread);

      return newThread;
    } else {
      throw Error(
        `unable to find sender or receiver\nsender: ${sentBy}\nreceiver: ${receiver}`
      );
    }
  }
}
