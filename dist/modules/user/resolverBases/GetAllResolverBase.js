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
const logger_1 = require("../../middleware/logger");
const isAuth_1 = require("../../middleware/isAuth");
function getBaseResolver(suffix, entity, objectTypeCls, relations) {
    let BaseResolver = class BaseResolver {
        getAll({ req }) {
            return __awaiter(this, void 0, void 0, function* () {
                console.log("what is on context.req", req);
                const dbQuery = {
                    relations: [...relations]
                };
                return yield entity.find(dbQuery);
            });
        }
    };
    __decorate([
        type_graphql_1.UseMiddleware(isAuth_1.isAuth, logger_1.logger),
        type_graphql_1.Query(() => [objectTypeCls], { name: `getAll${suffix}`, nullable: true }),
        __param(0, type_graphql_1.Ctx()),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [Object]),
        __metadata("design:returntype", Promise)
    ], BaseResolver.prototype, "getAll", null);
    BaseResolver = __decorate([
        type_graphql_1.Resolver({ isAbstract: true })
    ], BaseResolver);
    return BaseResolver;
}
exports.getBaseResolver = getBaseResolver;
//# sourceMappingURL=GetAllResolverBase.js.map