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
const User_1 = require("./User");
const Message_1 = require("./Message");
let Thread = class Thread extends typeorm_1.BaseEntity {
};
__decorate([
    type_graphql_1.Field(() => type_graphql_1.ID, { nullable: true }),
    typeorm_1.PrimaryGeneratedColumn("uuid"),
    __metadata("design:type", String)
], Thread.prototype, "id", void 0);
__decorate([
    type_graphql_1.Field(() => [Message_1.Message], { nullable: false }),
    typeorm_1.OneToMany(() => Message_1.Message, message => message.thread),
    __metadata("design:type", Array)
], Thread.prototype, "messages", void 0);
__decorate([
    type_graphql_1.Field(() => User_1.User, { nullable: false }),
    typeorm_1.ManyToOne(() => User_1.User, user => user.threads),
    __metadata("design:type", User_1.User)
], Thread.prototype, "user", void 0);
__decorate([
    type_graphql_1.Field(() => [User_1.User], { nullable: false }),
    typeorm_1.ManyToMany(() => User_1.User, user => user.thread_invitations),
    __metadata("design:type", Array)
], Thread.prototype, "invitees", void 0);
__decorate([
    type_graphql_1.Field(() => Date, { nullable: true }),
    typeorm_1.CreateDateColumn({ type: "timestamp" }),
    __metadata("design:type", Date)
], Thread.prototype, "created_at", void 0);
__decorate([
    type_graphql_1.Field(() => Date, { nullable: true }),
    typeorm_1.UpdateDateColumn({ type: "timestamp", nullable: true }),
    __metadata("design:type", Date)
], Thread.prototype, "updated_at", void 0);
Thread = __decorate([
    type_graphql_1.ObjectType(),
    typeorm_1.Entity()
], Thread);
exports.Thread = Thread;
//# sourceMappingURL=Thread.js.map