"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const apollo_server_express_1 = require("apollo-server-express");
const Express = __importStar(require("express"));
const type_graphql_1 = require("type-graphql");
const typeorm_1 = require("typeorm");
const express_session_1 = __importDefault(require("express-session"));
const connect_redis_1 = __importDefault(require("connect-redis"));
const http_1 = require("http");
const redis_1 = require("./redis");
const constants_1 = require("./constants");
const createSchema_1 = require("./global-utils/createSchema");
const logger_1 = require("./modules/middleware/logger/logger");
const RedisStore = connect_redis_1.default(express_session_1.default);
const PORT = process.env.PORT || 7777;
const sessionMiddleware = express_session_1.default({
    name: "qid",
    secret: process.env.SESSION_SECRET,
    store: new RedisStore({
        client: redis_1.redis,
        prefix: constants_1.redisSessionPrefix
    }),
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
});
const getContextFromHttpRequest = (req, res) => __awaiter(this, void 0, void 0, function* () {
    console.log("1 - getContextFromHttpRequest");
    const { userId } = req.session;
    console.log("2 - userId", userId);
    console.log("3 - Object.keys(req)", Object.keys(req));
    return { userId, req, res };
});
const getContextFromSubscription = (connection) => {
    const { userId } = connection.context.req.session;
    return { userId, req: connection.context.req };
};
const main = () => __awaiter(this, void 0, void 0, function* () {
    yield typeorm_1.createConnection();
    let schema;
    try {
        schema = yield createSchema_1.createSchema();
    }
    catch (error) {
        console.error(error);
    }
    const apolloServer = new apollo_server_express_1.ApolloServer({
        schema,
        subscriptions: {
            path: "/subscriptions",
            onConnect: (_, webSocket) => {
                return new Promise((resolve, reject) => sessionMiddleware(webSocket.upgradeReq, {}, () => {
                    if (!webSocket.upgradeReq.session.userId) {
                        reject("Not Authenticated");
                    }
                    resolve({
                        req: webSocket.upgradeReq
                    });
                }));
            }
        },
        context: ({ req, res, connection }) => {
            if (connection) {
                return getContextFromSubscription(connection);
            }
            return getContextFromHttpRequest(req, res);
        },
        formatError: (error) => {
            if (error.originalError instanceof apollo_server_express_1.ApolloError) {
                return error;
            }
            const { extensions = {}, locations, message, path } = error;
            if (error.originalError instanceof type_graphql_1.ArgumentValidationError) {
                extensions.code = "GRAPHQL_VALIDATION_FAILED";
                return {
                    extensions,
                    locations,
                    message,
                    path
                };
            }
            return {
                message: extensions.exception.stacktrace[0].replace("Error: ", ""),
                path,
                locations
            };
        },
        introspection: true,
        playground: true
    });
    const allowedOrigins = [
        "http://localhost:3000",
        "http://localhost:4000",
        "http://192.168.1.10:3000",
        "http://192.168.1.10:4000",
        "https://eddie-faux-gram.herokuapp.com",
        "ws://eddie-faux-gram.herokuapp.com",
        "ws://192.168.1.10:4000",
        "ws://192.168.1.10:3000",
        "ws://0.0.0.0:4000"
    ];
    const corsOptions = {
        credentials: true,
        origin: function (origin, callback) {
            if (!origin || allowedOrigins.indexOf(origin) !== -1) {
                console.log("looks good ");
                console.log("origin ", origin);
                console.log("callback ", callback);
                callback(null, true);
            }
            else {
                console.error("origin ", origin);
                console.error("Not allowd by CORS");
                callback(new Error("Not allowed by CORS"));
            }
        }
    };
    const app = Express.default();
    const wsServer = http_1.createServer(app);
    apolloServer.installSubscriptionHandlers(wsServer);
    app.use(sessionMiddleware);
    app.use("/graphql", (req, res, next) => {
        const startHrTime = process.hrtime();
        res.on("finish", () => {
            if (req.body && req.body.operationName) {
                const elapsedHrTime = process.hrtime(startHrTime);
                const elapsedTimeInMs = elapsedHrTime[0] * 1000 + elapsedHrTime[1] / 1e6;
                logger_1.logger.info(`${req.body.operationName} ${elapsedTimeInMs} ms`);
            }
        });
        next();
    });
    app.use("*/images", Express.static("public/images"));
    app.use("*/temp", Express.static("public/tmp/images"));
    apolloServer.applyMiddleware({ app, cors: corsOptions });
    wsServer.listen({ port: process.env.PORT || 4000 }, () => {
        console.log("\n\n");
        console.log(`🚀  Server started! GraphQL Playground ready at:\nhttp://localhost:${PORT}${apolloServer.graphqlPath}`);
        console.log("\n\n");
        console.log(`🚀 Subscriptions ready at:\nws://localhost:${PORT}${apolloServer.subscriptionsPath}`);
    });
});
main();
//# sourceMappingURL=index.js.map