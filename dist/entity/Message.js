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
const typeorm_1 = require("typeorm");
const User_1 = require("./User");
const Thread_1 = require("./Thread");
const Image_1 = require("./Image");
let Message = class Message extends typeorm_1.BaseEntity {
};
__decorate([
    type_graphql_1.Field(() => type_graphql_1.ID),
    typeorm_1.PrimaryGeneratedColumn("uuid"),
    __metadata("design:type", String)
], Message.prototype, "id", void 0);
__decorate([
    type_graphql_1.Field(() => Date, { nullable: true }),
    typeorm_1.CreateDateColumn({ type: "timestamp" }),
    __metadata("design:type", Date)
], Message.prototype, "created_at", void 0);
__decorate([
    type_graphql_1.Field(() => Date, { nullable: true }),
    typeorm_1.UpdateDateColumn({ type: "timestamp", nullable: true }),
    __metadata("design:type", Date)
], Message.prototype, "updated_at", void 0);
__decorate([
    type_graphql_1.Field(),
    typeorm_1.Column(),
    __metadata("design:type", String)
], Message.prototype, "message", void 0);
__decorate([
    type_graphql_1.Field(() => [Image_1.Image], { nullable: "itemsAndList" }),
    typeorm_1.OneToMany(() => Image_1.Image, image => image.message, { nullable: true }),
    __metadata("design:type", Array)
], Message.prototype, "images", void 0);
__decorate([
    type_graphql_1.Field(type => User_1.User),
    typeorm_1.ManyToOne(() => User_1.User, user => user.sent_messages, { cascade: true }),
    __metadata("design:type", User_1.User)
], Message.prototype, "sentBy", void 0);
__decorate([
    type_graphql_1.Field(type => User_1.User),
    typeorm_1.ManyToOne(() => User_1.User, user => user.messages, { cascade: true }),
    __metadata("design:type", User_1.User)
], Message.prototype, "user", void 0);
__decorate([
    type_graphql_1.Field(() => Thread_1.Thread, { nullable: true }),
    typeorm_1.ManyToOne(() => Thread_1.Thread, thread => thread.messages),
    __metadata("design:type", Thread_1.Thread)
], Message.prototype, "thread", void 0);
Message = __decorate([
    type_graphql_1.ObjectType(),
    typeorm_1.Entity()
], Message);
exports.Message = Message;
//# sourceMappingURL=Message.js.map