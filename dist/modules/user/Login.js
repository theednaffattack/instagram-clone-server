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
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const User_1 = require("../../entity/User");
let LoginResolver = class LoginResolver {
    login(email, password, ctx) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield User_1.User.findOne({ where: { email } });
            console.log("I HAVE MADE CHANGES");
            console.log("\n\n session", Object.keys(ctx));
            console.log("\n\nuser", user);
            if (!user) {
                return null;
            }
            const valid = bcryptjs_1.default.compare(password, user.password);
            if (!valid) {
                return null;
            }
            if (!user.confirmed) {
                throw new Error("Please confirm your account");
            }
            ctx.req.session.userId = user.id;
            return user;
        });
    }
};
__decorate([
    type_graphql_1.Mutation(() => User_1.User, { nullable: true }),
    __param(0, type_graphql_1.Arg("email")),
    __param(1, type_graphql_1.Arg("password")),
    __param(2, type_graphql_1.Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], LoginResolver.prototype, "login", null);
LoginResolver = __decorate([
    type_graphql_1.Resolver()
], LoginResolver);
exports.LoginResolver = LoginResolver;
//# sourceMappingURL=Login.js.map