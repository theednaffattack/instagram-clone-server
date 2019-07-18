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
var _a;
const type_graphql_1 = require("type-graphql");
const MessageThreadInput_1 = require("./MessageThreadInput");
const Thread_1 = require("../../entity/Thread");
const Message_1 = require("../../entity/Message");
const User_1 = require("../../entity/User");
const Image_1 = require("../../entity/Image");
const fs_1 = require("fs");
let AddMessagePayload = class AddMessagePayload {
};
__decorate([
    type_graphql_1.Field(() => Boolean),
    __metadata("design:type", Boolean)
], AddMessagePayload.prototype, "success", void 0);
__decorate([
    type_graphql_1.Field(() => type_graphql_1.ID),
    __metadata("design:type", String)
], AddMessagePayload.prototype, "threadId", void 0);
__decorate([
    type_graphql_1.Field(() => Message_1.Message),
    __metadata("design:type", Message_1.Message)
], AddMessagePayload.prototype, "message", void 0);
__decorate([
    type_graphql_1.Field(() => User_1.User),
    __metadata("design:type", User_1.User)
], AddMessagePayload.prototype, "user", void 0);
__decorate([
    type_graphql_1.Field(() => [User_1.User]),
    __metadata("design:type", Array)
], AddMessagePayload.prototype, "invitees", void 0);
AddMessagePayload = __decorate([
    type_graphql_1.ObjectType()
], AddMessagePayload);
exports.AddMessagePayload = AddMessagePayload;
let AddMessageToThreadResolver = class AddMessageToThreadResolver {
    messageThreads(threadPayload, input) {
        console.log("forced to use input".toUpperCase(), Object.keys(input));
        return threadPayload;
    }
    addMessageToThread(context, input, publish) {
        return __awaiter(this, void 0, void 0, function* () {
            const sentBy = yield User_1.User.findOne(context.userId);
            const receiver = yield User_1.User.findOne(input.sentTo);
            let existingThread;
            let newMessage;
            if (sentBy && receiver && input.images && input.images[0]) {
                const { filename, createReadStream } = yield input.images[0];
                let imageName = `${filename}.png`;
                let localImageUrl = `/../../../public/tmp/images/${imageName}`;
                let publicImageUrl = `http://192.168.1.10:4000/temp/${imageName}`;
                yield new Promise((resolve, reject) => {
                    createReadStream()
                        .pipe(fs_1.createWriteStream(__dirname + localImageUrl))
                        .on("finish", () => {
                        resolve(true);
                    })
                        .on("error", () => {
                        reject(false);
                    });
                });
                let newImage = yield Image_1.Image.create({
                    uri: publicImageUrl,
                    user: context.userId
                }).save();
                let createMessage = {
                    message: input.message,
                    user: receiver,
                    sentBy,
                    images: [newImage]
                };
                newMessage = yield Message_1.Message.create(createMessage).save();
                newImage.message = newMessage;
                let existingThread = yield Thread_1.Thread.findOne(input.threadId, {
                    relations: ["messages", "invitees", "messages.images"]
                }).catch(error => error);
                const foundThread = existingThread && existingThread.id ? true : false;
                existingThread.messages.push(newMessage);
                existingThread.save();
                newMessage.thread = existingThread;
                yield newMessage.save();
                let collectInvitees = [];
                yield Promise.all(input.invitees.map((person) => __awaiter(this, void 0, void 0, function* () {
                    let tempPerson = yield User_1.User.findOne(person);
                    collectInvitees.push(tempPerson);
                    return tempPerson;
                })));
                const returnObj = {
                    success: existingThread && foundThread ? true : false,
                    threadId: input.threadId,
                    message: newMessage,
                    user: receiver,
                    invitees: [...collectInvitees]
                };
                yield publish(returnObj);
                return returnObj;
            }
            if ((sentBy && receiver && input.images === undefined) ||
                (sentBy && receiver && input.images.length == 0)) {
                console.log("NO IMAGES");
                let createMessage = {
                    message: input.message,
                    user: receiver,
                    sentBy
                };
                existingThread = yield Thread_1.Thread.findOne(input.threadId, {
                    relations: ["messages", "invitees", "messages.images"]
                }).catch(error => error);
                newMessage = yield Message_1.Message.create(createMessage).save();
                newMessage.thread = existingThread;
                yield newMessage.save();
                let collectInvitees = [];
                yield Promise.all(input.invitees.map((person) => __awaiter(this, void 0, void 0, function* () {
                    let tempPerson = yield User_1.User.findOne(person);
                    collectInvitees.push(tempPerson);
                    return tempPerson;
                })));
                const returnObj = {
                    success: existingThread && existingThread.id ? true : false,
                    threadId: input.threadId,
                    message: newMessage,
                    user: receiver,
                    invitees: [...collectInvitees]
                };
                yield publish(returnObj);
                return returnObj;
            }
            else {
                console.log("WHAT IS INPUT.IMAGES", input.images);
                throw Error(`unable to find sender or receiver / sender / image: ${sentBy}\nreceiver: ${receiver}`);
            }
        });
    }
};
__decorate([
    type_graphql_1.Subscription(() => AddMessagePayload, {
        topics: ({ context }) => {
            if (!context.userId) {
                throw new Error("not authorized for this topic");
            }
            return "THREADS";
        },
        filter: ({ payload, args, context }) => {
            const messageMatchesThread = args.data.threadId === payload.threadId;
            if (messageMatchesThread) {
                return true;
            }
            else {
                return false;
            }
        }
    }),
    __param(0, type_graphql_1.Root()),
    __param(1, type_graphql_1.Arg("data", () => MessageThreadInput_1.AddMessageToThreadInput_v2)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [AddMessagePayload,
        MessageThreadInput_1.AddMessageToThreadInput_v2]),
    __metadata("design:returntype", AddMessagePayload)
], AddMessageToThreadResolver.prototype, "messageThreads", null);
__decorate([
    type_graphql_1.Mutation(type => AddMessagePayload),
    __param(0, type_graphql_1.Ctx()),
    __param(1, type_graphql_1.Args(type => MessageThreadInput_1.AddMessageToThreadInput)),
    __param(2, type_graphql_1.PubSub("THREADS")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, MessageThreadInput_1.AddMessageToThreadInput, typeof (_a = typeof Publisher !== "undefined" && Publisher) === "function" ? _a : Object]),
    __metadata("design:returntype", Promise)
], AddMessageToThreadResolver.prototype, "addMessageToThread", null);
AddMessageToThreadResolver = __decorate([
    type_graphql_1.Resolver()
], AddMessageToThreadResolver);
exports.AddMessageToThreadResolver = AddMessageToThreadResolver;
//# sourceMappingURL=AddMessageToThreads.js.map