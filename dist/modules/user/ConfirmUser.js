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
Object.defineProperty(exports, "__esModule", { value: true });
const type_graphql_1 = require("type-graphql");
const redis_1 = require("../../redis");
const User_1 = require("../../entity/User");
const redisPrefixes_1 = require("../constants/redisPrefixes");
let ConfirmUserResolver = class ConfirmUserResolver {
    confirmUser(token) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("working!");
            const userId = yield redis_1.redis.get(redisPrefixes_1.confirmUserPrefix + token);
            console.log("userId", userId);
            console.log("TOKEN AND PREFIX", redisPrefixes_1.confirmUserPrefix + token);
            if (!userId) {
                return false;
            }
            yield User_1.User.update({ id: userId }, { confirmed: true });
            yield redis_1.redis.del(token);
            return true;
        });
    }
};
__decorate([
    type_graphql_1.Mutation(() => Boolean),
    __param(0, type_graphql_1.Arg("token")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ConfirmUserResolver.prototype, "confirmUser", null);
ConfirmUserResolver = __decorate([
    type_graphql_1.Resolver()
], ConfirmUserResolver);
exports.ConfirmUserResolver = ConfirmUserResolver;
//# sourceMappingURL=ConfirmUser.js.map