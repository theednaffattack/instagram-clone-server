"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const CreatePostInput_1 = require("./createPost/CreatePostInput");
const type_graphql_1 = require("type-graphql");
const logger_1 = require("../middleware/logger");
const isAuth_1 = require("../middleware/isAuth");
const Image_1 = require("../../entity/Image");
const User_1 = require("../../entity/User");
const Post_1 = require("../../entity/Post");
let CreatePostResolver = class CreatePostResolver {
    create({ text, title, images, user: userId, picture }) {
        return __awaiter(this, void 0, void 0, function* () {
            let user = yield User_1.User.findOne(userId, {
                relations: ["images", "posts"]
            });
            if (user) {
                const { filename, createReadStream } = yield picture;
                const lastImage = images.length > 1 ? images.length - 1 : 0;
                let imageUrl = `/../../../public/tmp/images/${images[lastImage]}`;
                yield new Promise((resolve, reject) => {
                    createReadStream()
                        .pipe(fs_1.createWriteStream(__dirname + imageUrl))
                        .on("finish", () => {
                        resolve(true);
                    })
                        .on("error", () => {
                        reject(false);
                    });
                });
                const newImage = yield Image_1.Image.create({
                    uri: images[lastImage],
                    user: user
                });
                yield newImage.save();
                user.images.push(newImage);
                yield user.save();
                const postData = {
                    text,
                    title,
                    user,
                    images: [newImage]
                };
                let newPost = yield Post_1.Post.create(postData);
                yield newPost.save();
                newImage.post = newPost;
                yield newImage.save();
                user.posts.push(newPost);
                user.save();
                return yield newPost;
            }
            throw Error("the logged in user could not be found in the database");
        });
    }
};
__decorate([
    type_graphql_1.UseMiddleware(isAuth_1.isAuth, logger_1.logger),
    type_graphql_1.Mutation(() => Post_1.Post, { name: `createPost` }),
    __param(0, type_graphql_1.Arg("data", () => CreatePostInput_1.PostInput)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [CreatePostInput_1.PostInput]),
    __metadata("design:returntype", Promise)
], CreatePostResolver.prototype, "create", null);
CreatePostResolver = __decorate([
    type_graphql_1.Resolver()
], CreatePostResolver);
exports.CreatePostResolver = CreatePostResolver;
//# sourceMappingURL=GetMyPostsResolver.js.map