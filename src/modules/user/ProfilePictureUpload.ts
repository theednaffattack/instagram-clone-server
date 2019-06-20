import { Resolver, Mutation, Arg } from "type-graphql";
import { createWriteStream } from "fs";
import { GraphQLUpload } from "graphql-upload";

import { Upload } from "../../types/Upload";

@Resolver()
export class ProfilePictureResolver {
  @Mutation(() => Boolean)
  async addProfilePicture(@Arg("picture", () => GraphQLUpload)
  {
    createReadStream,
    filename
  }: Upload): Promise<boolean> {
    console.log("file upload!!!!!!!!!!!!!!");
    console.log(JSON.stringify(filename));
    return new Promise((resolve, reject) => {
      createReadStream()
        .pipe(createWriteStream(__dirname + `/../../../images/${filename}`))
        .on("finish", () => resolve(true))
        .on("error", () => reject(false));
    });
  }
}
