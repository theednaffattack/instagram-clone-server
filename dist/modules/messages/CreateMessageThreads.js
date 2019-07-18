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
const fs_1 = require("fs");
const MessageThreadInput_1 = require("./MessageThreadInput");
const Thread_1 = require("../../entity/Thread");
const Message_1 = require("../../entity/Message");
const User_1 = require("../../entity/User");
const Image_1 = require("../../entity/Image");
const isAuth_1 = require("../middleware/isAuth");
let CreateMessageThreadResolver = class CreateMessageThreadResolver {
    createMessageThread(context, input) {
        return __awaiter(this, void 0, void 0, function* () {
            const sentBy = yield User_1.User.findOne(context.userId);
            const collectInvitees = [];
            const invitees = yield Promise.all(input.invitees.map((person) => __awaiter(this, void 0, void 0, function* () {
                let tempPerson = yield User_1.User.findOne(person);
                collectInvitees.push(tempPerson);
                return tempPerson;
            })));
            const receiver = yield User_1.User.findOne(input.sentTo);
            console.log("Can I see invitees?".toUpperCase(), invitees);
            let newThread;
            const lastImage = input.images && input.images.length > 0 ? input.images.length - 1 : 0;
            console.log(sentBy && receiver && input.images && input.images[lastImage]);
            if (sentBy &&
                receiver &&
                input.images &&
                input.images[lastImage] &&
                invitees.length > 0) {
                const { filename, createReadStream } = yield input.images[lastImage];
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
                const newMessage = yield Message_1.Message.create(createMessage).save();
                newImage.message = newMessage;
                let createThread = {
                    user: sentBy,
                    invitees: [sentBy, receiver, ...collectInvitees],
                    messages: [newMessage]
                };
                newThread = yield Thread_1.Thread.create(createThread)
                    .save()
                    .catch((error) => error);
                return newThread;
            }
            if ((sentBy && receiver && !input.images) || !input.images[lastImage]) {
                let createMessage = {
                    message: input.message,
                    user: receiver,
                    sentBy
                };
                const newMessage = yield Message_1.Message.create(createMessage).save();
                let createThread = {
                    user: sentBy,
                    invitees: [sentBy, receiver, ...collectInvitees],
                    messages: [newMessage]
                };
                newThread = yield Thread_1.Thread.create(createThread)
                    .save()
                    .catch((error) => error);
                return newThread;
            }
            else {
                throw Error(`unable to find sender or receiver\nsender: ${sentBy}\nreceiver: ${receiver}`);
            }
        });
    }
};
__decorate([
    type_graphql_1.UseMiddleware(isAuth_1.isAuth),
    type_graphql_1.Mutation(() => Thread_1.Thread),
    __param(0, type_graphql_1.Ctx()),
    __param(1, type_graphql_1.Args(type => MessageThreadInput_1.CreateMessageThreadAndMessageInput)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, MessageThreadInput_1.CreateMessageThreadAndMessageInput]),
    __metadata("design:returntype", Promise)
], CreateMessageThreadResolver.prototype, "createMessageThread", null);
CreateMessageThreadResolver = __decorate([
    type_graphql_1.Resolver()
], CreateMessageThreadResolver);
exports.CreateMessageThreadResolver = CreateMessageThreadResolver;
//# sourceMappingURL=CreateMessageThreads.js.map