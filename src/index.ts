import "reflect-metadata";
import { ApolloServer, ApolloError } from "apollo-server-express";
import * as Express from "express";
import { ArgumentValidationError } from "type-graphql";
import { createConnection } from "typeorm";
import { GraphQLFormattedError, GraphQLError } from "graphql";
import session from "express-session";
import internalIp from "internal-ip";

import connectRedis from "connect-redis";
import { createServer } from "http";

import { redis } from "./redis";

import { redisSessionPrefix } from "./constants";
import { createSchema } from "./global-utils/createSchema";
import { logger } from "./modules/middleware/logger/logger";
import { devOrmconfig } from "./dev_ormconfig";
import { productionOrmConfig } from "./production_ormconfig";

const nodeEnvIsDev = process.env.NODE_ENV === "development";
const nodeEnvIsProd = process.env.NODE_ENV === "production";
const nodeEnvIs_NOT_Prod = process.env.NODE_ENV !== "production";

const ormConnection = nodeEnvIsDev ? devOrmconfig : productionOrmConfig;

const RedisStore = connectRedis(session);

let sessionMiddleware: Express.RequestHandler;

// needed to remove domain from our cookie
// in non-production environments
if (nodeEnvIsProd) {
  sessionMiddleware = session({
    name: "mfg",
    secret: process.env.SESSION_SECRET as string,
    store: new RedisStore({
      client: redis as any,
      prefix: redisSessionPrefix
    }),
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: nodeEnvIsProd,
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days,
      domain: "eddienaff.dev"
    }
  });
}

if (nodeEnvIsDev || nodeEnvIs_NOT_Prod) {
  sessionMiddleware = session({
    name: "mfg",
    secret: process.env.SESSION_SECRET as string,
    store: new RedisStore({
      client: redis as any,
      prefix: redisSessionPrefix
    }),
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: nodeEnvIsProd,
      maxAge: 1000 * 60 * 60 * 24 * 7 // 7 days,
    }
  });
}

const getContextFromHttpRequest = async (req: any, res: any) => {
  if (req.session) {
    const { userId } = req.session;
    return { userId, req, res };
  }
  return ["No session detected"];
};

const getContextFromSubscription = (connection: any) => {
  const { userId } = connection.context.req.session;
  return { userId, req: connection.context.req };
};

// const morganFormat = process.env.NODE_ENV !== "production" ? nodeEnvIsDev : "combined";

const main = async () => {
  try {
    await createConnection(ormConnection);
  } catch (error) {
    console.error(error);
  }

  let schema;

  try {
    schema = await createSchema();
  } catch (error) {
    console.error(error);
  }

  const apolloServer = new ApolloServer({
    introspection: true,
    playground: true,
    schema,
    subscriptions: {
      path: "/subscriptions",
      onConnect: (_, webSocket: any) => {
        return new Promise((resolve, reject) =>
          sessionMiddleware(webSocket.upgradeReq, {} as any, () => {
            if (!webSocket.upgradeReq.session.userId) {
              // throw Error("Not authenticated");
              reject("Not Authenticated");
            }
            resolve({
              req: webSocket.upgradeReq
              // userId: webSocket.upgradeReq.session.userId
            });
          })
        );
      }
    },
    context: ({ req, res, connection }: any) => {
      if (connection) {
        return getContextFromSubscription(connection);
      }

      return getContextFromHttpRequest(req, res);

      // return { req, res, connection };
    },
    // custom error handling from: https://github.com/19majkel94/type-graphql/issues/258
    formatError: (error: GraphQLError): GraphQLFormattedError => {
      if (error.originalError instanceof ApolloError) {
        return error;
      }

      const { extensions = {}, locations, message, path } = error;

      if (error.originalError instanceof ArgumentValidationError) {
        extensions.code = "GRAPHQL_VALIDATION_FAILED";

        return {
          extensions,
          locations,
          message,
          path
        };
      }

      //   error.message = "Internal Server Error";

      return {
        message: extensions.exception.stacktrace[0].replace("Error: ", ""),
        path,
        locations
        // extensions
      };
    }
  });

  const allowedOrigins = [
    "http://localhost:3000",
    "http://localhost:4000",
    "http://192.168.1.24:3000",
    "http://192.168.1.24:3030",
    "http://192.168.1.24:4000",
    "https://eddie-faux-gram.herokuapp.com",
    "https://fauxgramapi.eddienaff.dev",
    "https://fauxgramapp.eddienaff.dev",
    "wss://eddie-faux-gram.herokuapp.com",
    "wss://fauxgramapp.eddienaff.dev",
    "wss://fauxgramapi.eddienaff.dev",
    "wss://192.168.1.24:4000",
    "wss://192.168.1.24:3000",
    "wss://192.168.1.24:3030",
    "wss://0.0.0.0:4000",
    "ws://192.168.1.24:4000",
    "ws://192.168.1.24:3000",
    "ws://localhost:4000",
    "ws://localhost:3000"
  ];

  // a change

  const corsOptions = {
    credentials: true,
    origin: function(origin: any, callback: any) {
      if (!origin || allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        console.error("cors error:: origin: ", origin);
      }
    }
  };

  const app = Express.default();

  // needed for heroku deployment
  app.enable("trust proxy");

  // needed for heroku deployment
  // they set the "x-forwarded-proto" header???
  if (nodeEnvIsProd) {
    app.use(function(req, res, next) {
      if (req.header("x-forwarded-proto") !== "https") {
        res.redirect("https://" + req.header("host") + req.url);
      } else {
        next();
      }
    });
  }

  // app.use(cors(corsOptions));

  const wsServer = createServer(app);

  apolloServer.installSubscriptionHandlers(wsServer);

  app.use(sessionMiddleware);

  // resolver timing middleware
  app.use("/graphql", (req, res, next) => {
    const startHrTime = process.hrtime();

    res.on("finish", () => {
      if (req.body && req.body.operationName) {
        const elapsedHrTime = process.hrtime(startHrTime);
        const elapsedTimeInMs =
          elapsedHrTime[0] * 1000 + elapsedHrTime[1] / 1e6;
        logger.info(
          `${req.body.operationName} ${elapsedTimeInMs} ms`
          // {
          //   type: "timing",
          //   name: req.body.operationName,
          //   ms: elapsedTimeInMs
          // }
        );
        console.log(`${req.body.operationName} ${elapsedTimeInMs} ms`);
      }
    });
    next();
  });

  // app.use(Express.static(path.join(__dirname, "public")));
  app.use("*/images", Express.static("public/images"));
  app.use("*/temp", Express.static("public/tmp/images"));

  apolloServer.applyMiddleware({ app, cors: corsOptions });

  const port =
    nodeEnvIsDev || nodeEnvIs_NOT_Prod
      ? process.env.DEV_PORT
      : process.env.PORT;

  const playgroundMessage =
    nodeEnvIsDev || nodeEnvIs_NOT_Prod
      ? `\n\n🚀  Server started! GraphQL Playground ready at:\nhttp://${internalIp.v4.sync()}:${port}${
          apolloServer.graphqlPath
        }`
      : "";

  const subscriptionsMessage =
    nodeEnvIsDev || nodeEnvIs_NOT_Prod
      ? `\n\n🚀 Subscriptions ready at:\nws://${internalIp.v4.sync()}:${port}${
          apolloServer.subscriptionsPath
        }\n\n`
      : "";

  // wsServer.listen({ port: process.env.PORT || 4000 }, () => {
  wsServer.listen(port, () => {
    console.log(playgroundMessage);
    console.log(subscriptionsMessage);
  });
};

main();
