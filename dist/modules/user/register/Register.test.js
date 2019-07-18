"use strict";
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
const testConn_1 = require("../../../test-utils/testConn");
const casual_1 = __importDefault(require("casual"));
const gCall_1 = require("../../../test-utils/gCall");
const User_1 = require("../../../entity/User");
let conn;
beforeAll((done) => __awaiter(this, void 0, void 0, function* () {
    conn = yield testConn_1.testConn();
    done();
}));
afterAll((done) => __awaiter(this, void 0, void 0, function* () {
    yield conn.close();
    done();
}));
const mockUser = {
    firstName: casual_1.default.first_name,
    lastName: casual_1.default.last_name,
    email: casual_1.default.email,
    password: casual_1.default.password
};
const registerMutation = `
mutation Register($data: RegisterInput!) {
  register(
    data: $data
  ) {
    id
    firstName
    lastName
    email
    name
  }
}
`;
describe("Register", () => {
    it("create user", (done) => __awaiter(this, void 0, void 0, function* () {
        const response = yield gCall_1.gCall({
            source: registerMutation,
            variableValues: {
                data: mockUser
            }
        });
        expect(response).toMatchObject({
            data: {
                register: {
                    firstName: mockUser.firstName,
                    lastName: mockUser.lastName,
                    email: mockUser.email
                }
            }
        });
        const dbUser = yield User_1.User.findOne({ where: { email: mockUser.email } });
        expect(dbUser).toBeDefined();
        expect(dbUser.confirmed).toBeFalsy();
        expect(dbUser.firstName).toBe(mockUser.firstName);
        expect(dbUser.lastName).toBe(mockUser.lastName);
        done();
    }));
});
//# sourceMappingURL=Register.test.js.map