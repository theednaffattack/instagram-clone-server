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
const Image_1 = require("./Image");
const User_1 = require("./User");
let Post = class Post extends typeorm_1.BaseEntity {
};
__decorate([
    type_graphql_1.Field(() => type_graphql_1.ID, { nullable: true }),
    typeorm_1.PrimaryGeneratedColumn("uuid"),
    __metadata("design:type", String)
], Post.prototype, "id", void 0);
__decorate([
    type_graphql_1.Field({ nullable: true }),
    typeorm_1.Column({ nullable: true }),
    __metadata("design:type", String)
], Post.prototype, "title", void 0);
__decorate([
    type_graphql_1.Field({ nullable: true }),
    typeorm_1.Column(),
    __metadata("design:type", String)
], Post.prototype, "text", void 0);
__decorate([
    type_graphql_1.Field(() => [Image_1.Image], { nullable: true }),
    typeorm_1.OneToMany(() => Image_1.Image, image => image.post),
    __metadata("design:type", Array)
], Post.prototype, "images", void 0);
__decorate([
    type_graphql_1.Field(() => User_1.User, { nullable: true }),
    typeorm_1.ManyToOne(() => User_1.User, user => user.posts),
    __metadata("design:type", User_1.User)
], Post.prototype, "user", void 0);
__decorate([
    type_graphql_1.Field(() => Date, { nullable: true }),
    typeorm_1.CreateDateColumn({ type: "timestamp" }),
    __metadata("design:type", Date)
], Post.prototype, "created_at", void 0);
__decorate([
    type_graphql_1.Field(() => Date, { nullable: true }),
    typeorm_1.UpdateDateColumn({ type: "timestamp", nullable: true }),
    __metadata("design:type", Date)
], Post.prototype, "updated_at", void 0);
Post = __decorate([
    type_graphql_1.ObjectType(),
    typeorm_1.Entity()
], Post);
exports.Post = Post;
let PostSubType = class PostSubType {
};
__decorate([
    type_graphql_1.Field(type => type_graphql_1.ID),
    __metadata("design:type", String)
], PostSubType.prototype, "id", void 0);
__decorate([
    type_graphql_1.Field(type => String),
    __metadata("design:type", String)
], PostSubType.prototype, "title", void 0);
__decorate([
    type_graphql_1.Field(type => String),
    __metadata("design:type", String)
], PostSubType.prototype, "text", void 0);
__decorate([
    type_graphql_1.Field(type => [Image_1.Image]),
    __metadata("design:type", Array)
], PostSubType.prototype, "images", void 0);
__decorate([
    type_graphql_1.Field(type => User_1.User),
    __metadata("design:type", User_1.User)
], PostSubType.prototype, "user", void 0);
__decorate([
    type_graphql_1.Field(type => Date),
    __metadata("design:type", Date)
], PostSubType.prototype, "created_at", void 0);
__decorate([
    type_graphql_1.Field(type => Date),
    __metadata("design:type", Date)
], PostSubType.prototype, "updated_at", void 0);
PostSubType = __decorate([
    type_graphql_1.ObjectType()
], PostSubType);
exports.PostSubType = PostSubType;
//# sourceMappingURL=Post.js.map