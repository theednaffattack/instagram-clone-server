// import { MyImagesInput } from "./getMyImages/MyMessagesInput";
import { getBaseResolver } from "./resolverBases/GetAllResolverBase";
import { Image } from "../../entity/Image";

const GetAllMyImagesResolverBase = getBaseResolver(
  "MyImages",
  //   MyImagesInput,
  Image,
  Image,
  ["posts"]
);

export class GetAllMyImagesResolver extends GetAllMyImagesResolverBase {}
