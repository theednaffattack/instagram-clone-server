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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const type_graphql_1 = require("type-graphql");
const aws_sdk_1 = __importDefault(require("aws-sdk"));
let SignS3Input = class SignS3Input {
};
__decorate([
    type_graphql_1.Field(() => String, { nullable: false }),
    __metadata("design:type", String)
], SignS3Input.prototype, "filename", void 0);
__decorate([
    type_graphql_1.Field(() => String, { nullable: false }),
    __metadata("design:type", String)
], SignS3Input.prototype, "filetype", void 0);
SignS3Input = __decorate([
    type_graphql_1.ArgsType()
], SignS3Input);
let SignedS3Payload = class SignedS3Payload {
};
__decorate([
    type_graphql_1.Field(() => String),
    __metadata("design:type", String)
], SignedS3Payload.prototype, "url", void 0);
__decorate([
    type_graphql_1.Field(() => String),
    __metadata("design:type", String)
], SignedS3Payload.prototype, "signedRequest", void 0);
SignedS3Payload = __decorate([
    type_graphql_1.ObjectType()
], SignedS3Payload);
const s3Bucket = process.env.S3_BUCKET;
let SignS3 = class SignS3 {
    signS3(input) {
        return __awaiter(this, void 0, void 0, function* () {
            const { filename, filetype } = input;
            console.log("input", input);
            const credentials = {
                accessKeyId: process.env.AWS_ACCESS_KEY_ID,
                secretAccessKey: process.env.AWS_SECRET_KEY
            };
            aws_sdk_1.default.config.update(credentials);
            const s3 = new aws_sdk_1.default.S3({
                signatureVersion: "v4",
                region: "us-west-2"
            });
            const s3Params = {
                Bucket: s3Bucket,
                Key: filename,
                Expires: 60,
                ContentType: filetype
            };
            const signedRequest = yield s3.getSignedUrl("putObject", s3Params);
            const url = `https://${s3Bucket}.s3.amazonaws.com/${filename}`;
            return { url, signedRequest };
        });
    }
};
__decorate([
    type_graphql_1.Mutation(() => SignedS3Payload),
    __param(0, type_graphql_1.Args(() => SignS3Input)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [SignS3Input]),
    __metadata("design:returntype", Promise)
], SignS3.prototype, "signS3", null);
SignS3 = __decorate([
    type_graphql_1.Resolver()
], SignS3);
exports.SignS3 = SignS3;
//# sourceMappingURL=s3-sign-mutation.js.map