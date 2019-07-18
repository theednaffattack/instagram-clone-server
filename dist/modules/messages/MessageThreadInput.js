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
Object.defineProperty(exports, "__esModule", { value: true });
const type_graphql_1 = require("type-graphql");
const apollo_server_core_1 = require("apollo-server-core");
let CreateMessageThreadAndMessageInput = class CreateMessageThreadAndMessageInput {
};
__decorate([
    type_graphql_1.Field(type => String),
    __metadata("design:type", String)
], CreateMessageThreadAndMessageInput.prototype, "sentTo", void 0);
__decorate([
    type_graphql_1.Field(() => [type_graphql_1.ID]),
    __metadata("design:type", Array)
], CreateMessageThreadAndMessageInput.prototype, "invitees", void 0);
__decorate([
    type_graphql_1.Field(type => String),
    __metadata("design:type", String)
], CreateMessageThreadAndMessageInput.prototype, "message", void 0);
__decorate([
    type_graphql_1.Field(() => [apollo_server_core_1.GraphQLUpload], { nullable: "itemsAndList" }),
    __metadata("design:type", Array)
], CreateMessageThreadAndMessageInput.prototype, "images", void 0);
CreateMessageThreadAndMessageInput = __decorate([
    type_graphql_1.ArgsType()
], CreateMessageThreadAndMessageInput);
exports.CreateMessageThreadAndMessageInput = CreateMessageThreadAndMessageInput;
let AddMessageToThreadInput = class AddMessageToThreadInput {
};
__decorate([
    type_graphql_1.Field(type => type_graphql_1.ID),
    __metadata("design:type", String)
], AddMessageToThreadInput.prototype, "threadId", void 0);
__decorate([
    type_graphql_1.Field(type => String),
    __metadata("design:type", String)
], AddMessageToThreadInput.prototype, "sentTo", void 0);
__decorate([
    type_graphql_1.Field(() => [type_graphql_1.ID]),
    __metadata("design:type", Array)
], AddMessageToThreadInput.prototype, "invitees", void 0);
__decorate([
    type_graphql_1.Field(type => String),
    __metadata("design:type", String)
], AddMessageToThreadInput.prototype, "message", void 0);
__decorate([
    type_graphql_1.Field(() => [apollo_server_core_1.GraphQLUpload], { nullable: "itemsAndList" }),
    __metadata("design:type", Array)
], AddMessageToThreadInput.prototype, "images", void 0);
AddMessageToThreadInput = __decorate([
    type_graphql_1.ArgsType()
], AddMessageToThreadInput);
exports.AddMessageToThreadInput = AddMessageToThreadInput;
let AddMessageToThreadInput_v2 = class AddMessageToThreadInput_v2 {
};
__decorate([
    type_graphql_1.Field(type => type_graphql_1.ID),
    __metadata("design:type", String)
], AddMessageToThreadInput_v2.prototype, "threadId", void 0);
__decorate([
    type_graphql_1.Field(type => String),
    __metadata("design:type", String)
], AddMessageToThreadInput_v2.prototype, "sentTo", void 0);
__decorate([
    type_graphql_1.Field(() => [type_graphql_1.ID]),
    __metadata("design:type", Array)
], AddMessageToThreadInput_v2.prototype, "invitees", void 0);
__decorate([
    type_graphql_1.Field(type => String),
    __metadata("design:type", String)
], AddMessageToThreadInput_v2.prototype, "message", void 0);
__decorate([
    type_graphql_1.Field(() => [apollo_server_core_1.GraphQLUpload], { nullable: "itemsAndList" }),
    __metadata("design:type", Array)
], AddMessageToThreadInput_v2.prototype, "images", void 0);
AddMessageToThreadInput_v2 = __decorate([
    type_graphql_1.InputType()
], AddMessageToThreadInput_v2);
exports.AddMessageToThreadInput_v2 = AddMessageToThreadInput_v2;
let GetMessageThreadsFromUserInput = class GetMessageThreadsFromUserInput {
};
__decorate([
    type_graphql_1.Field(type => String),
    __metadata("design:type", String)
], GetMessageThreadsFromUserInput.prototype, "sentBy", void 0);
__decorate([
    type_graphql_1.Field(type => String),
    __metadata("design:type", String)
], GetMessageThreadsFromUserInput.prototype, "user", void 0);
GetMessageThreadsFromUserInput = __decorate([
    type_graphql_1.InputType()
], GetMessageThreadsFromUserInput);
exports.GetMessageThreadsFromUserInput = GetMessageThreadsFromUserInput;
let GetAllMyMessageThreadsInput = class GetAllMyMessageThreadsInput {
};
__decorate([
    type_graphql_1.Field(type => String),
    __metadata("design:type", String)
], GetAllMyMessageThreadsInput.prototype, "user", void 0);
GetAllMyMessageThreadsInput = __decorate([
    type_graphql_1.InputType()
], GetAllMyMessageThreadsInput);
exports.GetAllMyMessageThreadsInput = GetAllMyMessageThreadsInput;
let MessageThreadOutput = class MessageThreadOutput {
};
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", String)
], MessageThreadOutput.prototype, "message", void 0);
MessageThreadOutput = __decorate([
    type_graphql_1.ObjectType()
], MessageThreadOutput);
exports.MessageThreadOutput = MessageThreadOutput;
//# sourceMappingURL=MessageThreadInput.js.map