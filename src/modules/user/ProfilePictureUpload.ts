import { Resolver, Mutation, Arg, UseMiddleware } from "type-graphql";
import { createWriteStream } from "fs";
import { GraphQLUpload } from "graphql-upload";

import { Upload } from "../../types/Upload";
import { isAuth } from "../middleware/isAuth";
import { logger } from "../middleware/logger";

@Resolver()
export class ProfilePictureResolver {
  @UseMiddleware(isAuth, logger)
  @Mutation(() => Boolean)
  async addProfilePicture(@Arg("picture", () => GraphQLUpload)
  {
    createReadStream,
    filename
  }: Upload): Promise<boolean> {
    return new Promise((resolve, reject) => {
      createReadStream()
        .pipe(
          createWriteStream(
            __dirname + `/../../../public/tmp/images/${filename}`
          )
        )
        .on("finish", () => {
          resolve(true);
        })
        .on("error", () => {
          reject(false);
        });
    });
  }
}
