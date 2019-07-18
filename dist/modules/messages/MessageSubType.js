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
const User_1 = require("../../entity/User");
let MessageSubType = class MessageSubType {
};
__decorate([
    type_graphql_1.Field(type => type_graphql_1.ID),
    __metadata("design:type", String)
], MessageSubType.prototype, "id", void 0);
__decorate([
    type_graphql_1.Field(type => String, { nullable: true }),
    __metadata("design:type", String)
], MessageSubType.prototype, "message", void 0);
__decorate([
    type_graphql_1.Field(type => User_1.User),
    __metadata("design:type", User_1.User)
], MessageSubType.prototype, "sentBy", void 0);
__decorate([
    type_graphql_1.Field(type => User_1.User),
    __metadata("design:type", User_1.User)
], MessageSubType.prototype, "user", void 0);
__decorate([
    type_graphql_1.Field(type => Date, { nullable: true }),
    __metadata("design:type", Date)
], MessageSubType.prototype, "created_at", void 0);
__decorate([
    type_graphql_1.Field(type => Date, { nullable: true }),
    __metadata("design:type", Date)
], MessageSubType.prototype, "updated_at", void 0);
MessageSubType = __decorate([
    type_graphql_1.ObjectType()
], MessageSubType);
exports.MessageSubType = MessageSubType;
//# sourceMappingURL=MessageSubType.js.map