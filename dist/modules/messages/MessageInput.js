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
let MessageFromUserInput = class MessageFromUserInput {
};
__decorate([
    type_graphql_1.Field(type => String),
    __metadata("design:type", String)
], MessageFromUserInput.prototype, "sentTo", void 0);
__decorate([
    type_graphql_1.Field(type => String),
    __metadata("design:type", String)
], MessageFromUserInput.prototype, "message", void 0);
MessageFromUserInput = __decorate([
    type_graphql_1.ArgsType()
], MessageFromUserInput);
exports.MessageFromUserInput = MessageFromUserInput;
let GetMessagesFromUserInput = class GetMessagesFromUserInput {
};
__decorate([
    type_graphql_1.Field(type => String),
    __metadata("design:type", String)
], GetMessagesFromUserInput.prototype, "sentBy", void 0);
__decorate([
    type_graphql_1.Field(type => String),
    __metadata("design:type", String)
], GetMessagesFromUserInput.prototype, "user", void 0);
GetMessagesFromUserInput = __decorate([
    type_graphql_1.InputType()
], GetMessagesFromUserInput);
exports.GetMessagesFromUserInput = GetMessagesFromUserInput;
let GetAllMyMessagesInput = class GetAllMyMessagesInput {
};
__decorate([
    type_graphql_1.Field(type => String),
    __metadata("design:type", String)
], GetAllMyMessagesInput.prototype, "user", void 0);
GetAllMyMessagesInput = __decorate([
    type_graphql_1.InputType()
], GetAllMyMessagesInput);
exports.GetAllMyMessagesInput = GetAllMyMessagesInput;
let MessageOutput = class MessageOutput {
};
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", String)
], MessageOutput.prototype, "message", void 0);
MessageOutput = __decorate([
    type_graphql_1.ObjectType()
], MessageOutput);
exports.MessageOutput = MessageOutput;
//# sourceMappingURL=MessageInput.js.map