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
const type_graphql_1 = require("type-graphql");
const isAuth_1 = require("../middleware/isAuth");
const logger_1 = require("../middleware/logger");
const User_1 = require("../../entity/User");
let GetThoseIFollowAndTheirPostsResolver = class GetThoseIFollowAndTheirPostsResolver {
    getThoseIFollowAndTheirPostsResolver(ctx) {
        return __awaiter(this, void 0, void 0, function* () {
            const userId = ctx.req.session ? ctx.req.session.userId : null;
            let thoseIFollowAndTheirPosts = yield User_1.User.findOne({
                where: { id: userId },
                relations: [
                    "following",
                    "following.posts",
                    "following.posts.user",
                    "following.posts.images"
                ]
            });
            console.log("thoseIFollowAndTheirPosts".toUpperCase());
            console.log(JSON.stringify(thoseIFollowAndTheirPosts, null, 4));
            const justThePosts = thoseIFollowAndTheirPosts.following.map(person => person.posts.map(post => post));
            console.log("justThePosts".toUpperCase(), justThePosts);
            if (thoseIFollowAndTheirPosts) {
                return thoseIFollowAndTheirPosts;
            }
            else {
                return [];
            }
        });
    }
};
__decorate([
    type_graphql_1.UseMiddleware(isAuth_1.isAuth, logger_1.logger),
    type_graphql_1.Query(() => User_1.User, {
        name: "getThoseIFollowAndTheirPostsResolver",
        nullable: true
    }),
    __param(0, type_graphql_1.Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], GetThoseIFollowAndTheirPostsResolver.prototype, "getThoseIFollowAndTheirPostsResolver", null);
GetThoseIFollowAndTheirPostsResolver = __decorate([
    type_graphql_1.Resolver()
], GetThoseIFollowAndTheirPostsResolver);
exports.GetThoseIFollowAndTheirPostsResolver = GetThoseIFollowAndTheirPostsResolver;
//# sourceMappingURL=GetThoseIFollowAndTheirPostsResolver.js.map