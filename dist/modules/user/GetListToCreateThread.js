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
let TransUserReturn = class TransUserReturn {
};
__decorate([
    type_graphql_1.Field(() => type_graphql_1.ID),
    __metadata("design:type", String)
], TransUserReturn.prototype, "id", void 0);
__decorate([
    type_graphql_1.Field(() => String),
    __metadata("design:type", String)
], TransUserReturn.prototype, "firstName", void 0);
__decorate([
    type_graphql_1.Field(() => String),
    __metadata("design:type", String)
], TransUserReturn.prototype, "lastName", void 0);
__decorate([
    type_graphql_1.Field(() => [User_1.User], { nullable: true }),
    __metadata("design:type", Array)
], TransUserReturn.prototype, "thoseICanMessage", void 0);
TransUserReturn = __decorate([
    type_graphql_1.ObjectType()
], TransUserReturn);
exports.TransUserReturn = TransUserReturn;
let GetListToCreateThread = class GetListToCreateThread {
    getListToCreateThread(ctx) {
        return __awaiter(this, void 0, void 0, function* () {
            let me = ctx.req && ctx.req.session ? ctx.req.session.userId : null;
            if (me) {
                const thoseICanMessage = [];
                let meWithFollowers = yield User_1.User.findOne(me, {
                    relations: ["followers", "following"]
                });
                let returnObj = {};
                if (meWithFollowers) {
                    meWithFollowers.followers.forEach(follower => {
                        thoseICanMessage.push(follower);
                    });
                    meWithFollowers.following.forEach(Ifollow => {
                        thoseICanMessage.push(Ifollow);
                    });
                    const finalMessageList = new Set(thoseICanMessage);
                    const finalUniqMessageList = [
                        ...new Set(thoseICanMessage.map(user => user.id))
                    ];
                    const finalMsgListArray = Array.from(finalMessageList);
                    returnObj.id = meWithFollowers.id;
                    returnObj.firstName = meWithFollowers.firstName;
                    returnObj.lastName = meWithFollowers.lastName;
                }
                const result = [];
                const map = new Map();
                for (const item of thoseICanMessage) {
                    if (!map.has(item.id)) {
                        map.set(item.id, true);
                        result.push(Object.assign({}, item));
                    }
                }
                console.log("result", result);
                returnObj.thoseICanMessage = [...result];
                return returnObj;
            }
            else {
                throw Error("Authentication error");
            }
        });
    }
};
__decorate([
    type_graphql_1.Query(() => TransUserReturn, { nullable: true }),
    __param(0, type_graphql_1.Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], GetListToCreateThread.prototype, "getListToCreateThread", null);
GetListToCreateThread = __decorate([
    type_graphql_1.Resolver()
], GetListToCreateThread);
exports.GetListToCreateThread = GetListToCreateThread;
//# sourceMappingURL=GetListToCreateThread.js.map