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
const class_validator_1 = require("class-validator");
const graphql_upload_1 = require("graphql-upload");
const type_graphql_1 = require("type-graphql");
let PostInput = class PostInput {
};
__decorate([
    type_graphql_1.Field(),
    class_validator_1.Length(1, 255),
    __metadata("design:type", String)
], PostInput.prototype, "text", void 0);
__decorate([
    type_graphql_1.Field({ nullable: true }),
    class_validator_1.Length(1, 255),
    __metadata("design:type", String)
], PostInput.prototype, "title", void 0);
__decorate([
    type_graphql_1.Field(() => type_graphql_1.ID),
    __metadata("design:type", String)
], PostInput.prototype, "user", void 0);
__decorate([
    type_graphql_1.Field(() => [String], { nullable: "itemsAndList" }),
    __metadata("design:type", Array)
], PostInput.prototype, "images", void 0);
__decorate([
    type_graphql_1.Field(() => graphql_upload_1.GraphQLUpload),
    __metadata("design:type", Object)
], PostInput.prototype, "picture", void 0);
PostInput = __decorate([
    type_graphql_1.InputType()
], PostInput);
exports.PostInput = PostInput;
//# sourceMappingURL=CreatePostInput.js.map