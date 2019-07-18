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
const User_1 = require("../../entity/User");
let FollowUserInput = class FollowUserInput {
};
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", String)
], FollowUserInput.prototype, "userIDToFollow", void 0);
FollowUserInput = __decorate([
    type_graphql_1.InputType()
], FollowUserInput);
exports.FollowUserInput = FollowUserInput;
let FollowUser = class FollowUser {
    followUser({ userIDToFollow }, ctx) {
        return __awaiter(this, void 0, void 0, function* () {
            let me = ctx.req && ctx.req.session ? ctx.req.session.userId : null;
            if (me === userIDToFollow)
                return false;
            const isMeAFollower = yield User_1.User.createQueryBuilder("user")
                .where({ id: userIDToFollow })
                .leftJoinAndSelect("user.followers", "follower", "follower.id = :id", {
                id: me
            })
                .getOne();
            console.log("isMeAFollower".toUpperCase(), isMeAFollower);
            if (isMeAFollower.followers.length === 0) {
                let findRelationship;
                findRelationship = () => __awaiter(this, void 0, void 0, function* () {
                    yield User_1.User.createQueryBuilder()
                        .relation(User_1.User, "followers")
                        .of(userIDToFollow)
                        .add(me)
                        .then(data => data)
                        .catch(error => console.error("MY ERROR:", error));
                });
                console.log("findRelationship".toUpperCase(), findRelationship());
                return true;
            }
            if (isMeAFollower && isMeAFollower.followers.length > 0) {
                return false;
            }
            throw Error("Oh no! this isn't intended to be reachable");
        });
    }
};
__decorate([
    type_graphql_1.Mutation(() => Boolean),
    __param(0, type_graphql_1.Arg("data", { nullable: false })),
    __param(1, type_graphql_1.Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [FollowUserInput, Object]),
    __metadata("design:returntype", Promise)
], FollowUser.prototype, "followUser", null);
FollowUser = __decorate([
    type_graphql_1.Resolver()
], FollowUser);
exports.FollowUser = FollowUser;
//# sourceMappingURL=FollowUser.js.map