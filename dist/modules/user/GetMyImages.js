"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const GetAllResolverBase_1 = require("./resolverBases/GetAllResolverBase");
const Image_1 = require("../../entity/Image");
const GetAllMyImagesResolverBase = GetAllResolverBase_1.getBaseResolver("MyImages", Image_1.Image, Image_1.Image, ["posts"]);
class GetAllMyImagesResolver extends GetAllMyImagesResolverBase {
}
exports.GetAllMyImagesResolver = GetAllMyImagesResolver;
//# sourceMappingURL=GetMyImages.js.map