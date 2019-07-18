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
const typeorm_1 = require("typeorm");
const type_graphql_1 = require("type-graphql");
const Post_1 = require("./Post");
const User_1 = require("./User");
const Message_1 = require("./Message");
let Image = class Image extends typeorm_1.BaseEntity {
};
__decorate([
    type_graphql_1.Field(() => type_graphql_1.ID),
    typeorm_1.PrimaryGeneratedColumn("uuid"),
    __metadata("design:type", String)
], Image.prototype, "id", void 0);
__decorate([
    type_graphql_1.Field(),
    typeorm_1.Column(),
    __metadata("design:type", String)
], Image.prototype, "uri", void 0);
__decorate([
    type_graphql_1.Field(type => Post_1.Post),
    typeorm_1.ManyToOne(() => Post_1.Post, post => post.images),
    __metadata("design:type", Post_1.Post)
], Image.prototype, "post", void 0);
__decorate([
    type_graphql_1.Field(type => Message_1.Message, { nullable: true }),
    typeorm_1.ManyToOne(() => Message_1.Message, message => message.images, { nullable: true }),
    __metadata("design:type", Message_1.Message)
], Image.prototype, "message", void 0);
__decorate([
    type_graphql_1.Field(type => User_1.User),
    typeorm_1.ManyToOne(() => User_1.User, user => user.images),
    __metadata("design:type", User_1.User)
], Image.prototype, "user", void 0);
Image = __decorate([
    type_graphql_1.ObjectType(),
    typeorm_1.Entity()
], Image);
exports.Image = Image;
//# sourceMappingURL=Image.js.map