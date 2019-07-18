import {
  Args,
  Resolver,
  Mutation,
  ObjectType,
  ArgsType,
  Field
} from "type-graphql";
import aws from "aws-sdk";

@ArgsType()
class SignS3Input {
  @Field(() => String, { nullable: false })
  filename: string;

  @Field(() => String, { nullable: false })
  filetype: string;
}

@ObjectType()
class SignedS3Payload {
  @Field(() => String)
  url: string;

  @Field(() => String)
  signedRequest: string;
}

// const USER_ADDED = "USER_ADDED";
const s3Bucket = process.env.S3_BUCKET;

// const formatErrors = (e, models) => {
//   if (e instanceof models.sequelize.ValidationError) {
//     return e.errors.map(x => _.pick(x, ["path", "message"]));
//   }
//   return [{ path: "name", message: "something went wrong" }];
// };

@Resolver()
export class SignS3 {
  @Mutation(() => SignedS3Payload)
  async signS3(
    @Args(() => SignS3Input) input: SignS3Input
  ): Promise<SignedS3Payload> {
    // @ts-ignore
    const { filename, filetype } = input;

    console.log("input", input);

    const credentials = {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_KEY
    };

    aws.config.update(credentials);

    const s3 = new aws.S3({
      signatureVersion: "v4",
      region: "us-west-2"
    });

    const s3Params = {
      Bucket: s3Bucket,
      Key: filename,
      Expires: 60,
      ContentType: filetype
      // ACL: "public-read"
    };

    const signedRequest = await s3.getSignedUrl("putObject", s3Params);
    const url = `https://${s3Bucket}.s3.amazonaws.com/${filename}`;

    return { url, signedRequest };
  }
}
