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
Object.defineProperty(exports, "__esModule", { value: true });
var User_1;
const typeorm_1 = require("typeorm");
const type_graphql_1 = require("type-graphql");
const Post_1 = require("./Post");
const Image_1 = require("./Image");
const Message_1 = require("./Message");
const Thread_1 = require("./Thread");
let User = User_1 = class User extends typeorm_1.BaseEntity {
    name(parent) {
        return `${parent.firstName} ${parent.lastName}`;
    }
};
__decorate([
    type_graphql_1.Field(() => type_graphql_1.ID),
    typeorm_1.PrimaryGeneratedColumn("uuid"),
    __metadata("design:type", String)
], User.prototype, "id", void 0);
__decorate([
    type_graphql_1.Field(),
    typeorm_1.Column(),
    __metadata("design:type", String)
], User.prototype, "firstName", void 0);
__decorate([
    type_graphql_1.Field(() => [Message_1.Message]),
    __metadata("design:type", Message_1.Message)
], User.prototype, "mappedMessages", void 0);
__decorate([
    type_graphql_1.Field(),
    typeorm_1.Column(),
    __metadata("design:type", String)
], User.prototype, "lastName", void 0);
__decorate([
    type_graphql_1.Field(),
    typeorm_1.Column("text", { unique: true }),
    __metadata("design:type", String)
], User.prototype, "email", void 0);
__decorate([
    type_graphql_1.Field(() => [Thread_1.Thread], { nullable: true }),
    typeorm_1.OneToMany(() => Thread_1.Thread, thread => thread.user),
    __metadata("design:type", Array)
], User.prototype, "threads", void 0);
__decorate([
    type_graphql_1.Field(),
    __param(0, type_graphql_1.Root()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [User]),
    __metadata("design:returntype", String)
], User.prototype, "name", null);
__decorate([
    typeorm_1.Column(),
    __metadata("design:type", String)
], User.prototype, "password", void 0);
__decorate([
    type_graphql_1.Field(type => Boolean),
    typeorm_1.Column("bool", { default: false }),
    __metadata("design:type", Boolean)
], User.prototype, "confirmed", void 0);
__decorate([
    type_graphql_1.Field(type => Post_1.Post, { nullable: true }),
    typeorm_1.OneToMany(() => Post_1.Post, post => post.user),
    __metadata("design:type", Array)
], User.prototype, "posts", void 0);
__decorate([
    type_graphql_1.Field(type => Image_1.Image, { nullable: true }),
    typeorm_1.OneToMany(() => Image_1.Image, image => image.user, { nullable: true }),
    __metadata("design:type", Array)
], User.prototype, "images", void 0);
__decorate([
    type_graphql_1.Field(type => Image_1.Image, { nullable: true }),
    typeorm_1.Column("varchar", { nullable: true }),
    __metadata("design:type", String)
], User.prototype, "profileImgUrl", void 0);
__decorate([
    type_graphql_1.Field(type => [Message_1.Message], { nullable: true }),
    typeorm_1.OneToMany(() => Message_1.Message, message => message.user),
    __metadata("design:type", Array)
], User.prototype, "messages", void 0);
__decorate([
    type_graphql_1.Field(type => [Message_1.Message], { nullable: true }),
    typeorm_1.OneToMany(() => Message_1.Message, message => message.sentBy),
    __metadata("design:type", Array)
], User.prototype, "sent_messages", void 0);
__decorate([
    type_graphql_1.Field(type => [User_1], { nullable: "itemsAndList" }),
    typeorm_1.ManyToMany(type => User_1, user => user.following, { nullable: true }),
    typeorm_1.JoinTable(),
    __metadata("design:type", Array)
], User.prototype, "followers", void 0);
__decorate([
    type_graphql_1.Field(type => [Thread_1.Thread], { nullable: "itemsAndList" }),
    typeorm_1.ManyToMany(type => Thread_1.Thread, thread => thread.invitees, { nullable: true }),
    typeorm_1.JoinTable(),
    __metadata("design:type", Array)
], User.prototype, "thread_invitations", void 0);
__decorate([
    type_graphql_1.Field(type => [User_1], { nullable: "itemsAndList" }),
    typeorm_1.ManyToMany(type => User_1, user => user.followers, { nullable: true }),
    __metadata("design:type", Array)
], User.prototype, "following", void 0);
User = User_1 = __decorate([
    type_graphql_1.ObjectType(),
    typeorm_1.Entity()
], User);
exports.User = User;
//# sourceMappingURL=User.js.map