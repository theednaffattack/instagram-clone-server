import "reflect-metadata";
import { ApolloServer, ApolloError } from "apollo-server-express";
import * as Express from "express";
import { ArgumentValidationError } from "type-graphql";
import { createConnection } from "typeorm";
import { GraphQLFormattedError, GraphQLError } from "graphql";
import session from "express-session";

import connectRedis from "connect-redis";
import { createServer } from "http";

import { redis } from "./redis";

import { redisSessionPrefix } from "./constants";
import { createSchema } from "./global-utils/createSchema";
import { logger } from "./modules/middleware/logger/logger";

// import queryComplexity, {
//   fieldConfigEstimator,
//   simpleEstimator
// } from "graphql-query-complexity";

const RedisStore = connectRedis(session);

const PORT = process.env.PORT || 7777;

console.log("CAN I SEE THE SECRET?", process.env.SESSION_SECRET);

const sessionMiddleware = session({
  name: "qid",
  secret: process.env.SESSION_SECRET as string,
  store: new RedisStore({
    client: redis as any,
    prefix: redisSessionPrefix
  }),
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days,
    domain: "eddienaff.dev"
  }
});

const getContextFromHttpRequest = async (req: any, res: any) => {
  console.log("0 - middleware running");
  if (req.session) {
    console.log("1 - getContextFromHttpRequest");

    console.log("\n\n3 - req.session", req.session);

    const { userId } = req.session;

    console.log("2 - userId", userId);
    return { userId, req, res };
  }
  return ["No session detected"];
};

const getContextFromSubscription = (connection: any) => {
  // const { userId } = connection.context;
  console.log(
    "X - connection.context.req.session;",
    connection.context.req.session
  );
  const { userId } = connection.context.req.session;
  return { userId, req: connection.context.req };
};

// const morganFormat = process.env.NODE_ENV !== "production" ? "dev" : "combined";

const main = async () => {
  await createConnection();

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
    "http://192.168.1.10:3000",
    "http://192.168.1.10:4000",
    "https://eddie-faux-gram.herokuapp.com",
    "https://fauxgram.eddienaff.dev",
    "https://fauxgramapp.eddienaff.dev",
    "ws://fauxgramapp.eddienaff.dev",
    "ws://eddie-faux-gram.herokuapp.com",
    "ws://fauxgram.eddienaff.dev",
    "ws://192.168.1.10:4000",
    "ws://192.168.1.10:3000",
    "ws://0.0.0.0:4000"
  ];

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

  // app.set("trust proxy", 1);

  app.enable("trust proxy");

  app.use(function(req, res, next) {
    if (req.header("x-forwarded-proto") !== "https") {
      res.redirect("https://" + req.header("host") + req.url);
    } else {
      next();
    }
  });

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
      }
    });
    next();
  });

  // app.use(Express.static(path.join(__dirname, "public")));
  app.use("*/images", Express.static("public/images"));
  app.use("*/temp", Express.static("public/tmp/images"));

  apolloServer.applyMiddleware({ app, cors: corsOptions });

  // app.listen(4000, () => {
  //   console.log(
  //     "server started! GraphQL Playground available at:\nhttp://localhost:4000/graphql"
  //   );
  // });

  wsServer.listen({ port: process.env.PORT || 4000 }, () => {
    console.log("\n\n");
    console.log(
      `🚀  Server started! GraphQL Playground ready at:\nhttp://localhost:${PORT}${
        apolloServer.graphqlPath
      }`
    );
    console.log("\n\n");
    console.log(
      `🚀 Subscriptions ready at:\nws://localhost:${PORT}${
        apolloServer.subscriptionsPath
      }`
    );
  });
};

main();
