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
const Thread_1 = require("../../entity/Thread");
const isAuth_1 = require("../middleware/isAuth");
let GetMessageThreadsResolver = class GetMessageThreadsResolver {
    getMessageThreads(context) {
        return __awaiter(this, void 0, void 0, function* () {
            const qThreads = yield Thread_1.Thread.createQueryBuilder("thread")
                .leftJoinAndSelect("thread.messages", "message")
                .leftJoinAndSelect("message.sentBy", "sentBy")
                .leftJoinAndSelect("message.user", "user")
                .leftJoinAndSelect("message.images", "image")
                .leftJoinAndSelect("thread.invitees", "userB")
                .where("userB.id = :id", { id: context.userId })
                .orderBy("message.created_at", "ASC")
                .getMany();
            let cache = [];
            qThreads.forEach(thread => {
                const sortedMessages = thread.messages.sort(function (a, b) {
                    return a.created_at.getTime() - b.created_at.getTime();
                });
                const copyThread = Object.assign({}, thread, { messages: [...sortedMessages] });
                cache.push(copyThread);
            });
            let newData = {
                getMessageThreads: [...cache]
            };
            console.log("VIEW THREADS newData", JSON.stringify(newData.getMessageThreads[0], null, 2));
            return newData.getMessageThreads;
        });
    }
};
__decorate([
    type_graphql_1.UseMiddleware(isAuth_1.isAuth),
    type_graphql_1.Query(() => [Thread_1.Thread], { nullable: "itemsAndList" }),
    __param(0, type_graphql_1.Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], GetMessageThreadsResolver.prototype, "getMessageThreads", null);
GetMessageThreadsResolver = __decorate([
    type_graphql_1.Resolver()
], GetMessageThreadsResolver);
exports.GetMessageThreadsResolver = GetMessageThreadsResolver;
//# sourceMappingURL=GetMessageThreads.js.map