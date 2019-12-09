import "reflect-metadata";
import "dotenv/config";
import { createConnection } from "typeorm";
import { ApolloServer, ApolloError } from "apollo-server-express";
import Express from "express";
import session from "express-session";
import http from "http";
import connectRedis from "connect-redis";
import { ArgumentValidationError } from "type-graphql";
import { GraphQLFormattedError, GraphQLError } from "graphql";
import https from "https";
import fs from "fs";
import path from "path";
// import logger from "express-pino-logger";

import { createSchema } from "./global-utils/createSchema";
import { redis } from "./redis";
import { redisSessionPrefix } from "./constants";
import { devOrmconfig } from "./dev_ormconfig";
import { productionOrmConfig } from "./production_ormconfig";

interface CertType {
  key: Buffer;
  cert: Buffer;
}

const nodeEnvIsDev = process.env.NODE_ENV === "development";
const nodeEnvIsProd = process.env.NODE_ENV === "production";
const nodeEnvIs_NOT_Prod = process.env.NODE_ENV !== "production";

const devPort = "4000";

const port = nodeEnvIsProd ? process.env.PORT : devPort;

// const devHost = "192.168.1.24";
const devHost = "localhost";

const prodHost = "fauxgramapi.eddienaff.dev";

const protocol = "https://";

let certOptions: CertType;

if (nodeEnvIs_NOT_Prod) {
  certOptions = {
    key: fs.readFileSync(path.resolve("dist/cert/server.key")),
    cert: fs.readFileSync(path.resolve("dist/cert/server.crt"))
  };
}

const host = nodeEnvIsProd
  ? `${protocol}${prodHost}/graphql`
  : `${protocol}${devHost}:${port}/graphql`;

let message = `\n🚀 Server is ready at:\n${host}`;

const ormConnection = nodeEnvIsDev ? devOrmconfig : productionOrmConfig;

let ngrokUri = "http://e7dd14a8.ngrok.io";

let allowedOrigins = nodeEnvIs_NOT_Prod
  ? [
      // "http://192.168.1.24:3030",
      // "http://192.168.1.24:4000",
      // "ws://192.168.1.24:4000",
      // "ws://192.168.1.24:3000",
      // "http://localhost:3030",

      "https://192.168.1.24:3030",
      "https://192.168.1.24:4000",
      "wss://192.168.1.24:4000",
      "wss://192.168.1.24:3000",
      "wss://localhost:4000",
      "wss://localhost:3000",
      "https://localhost:4000",
      "https://localhost:3030",
      ngrokUri
    ]
  : [
      "https://faux-gram-client-nextjs.herokuapp.com", // prod frontend
      "https://eddie-faux-gram.herokuapp.com", // prod backend
      "https://fauxgramapp.eddienaff.dev", // public frontend
      "https://fauxgramapi.eddienaff.dev", // public backend
      "wss://eddie-faux-gram.herokuapp.com",
      "wss://fauxgramapp.eddienaff.dev",
      "wss://fauxgramapi.eddienaff.dev"
      // "wss://0.0.0.0:4000"
      // "wss://192.168.1.24:4000",
      // "wss://192.168.1.24:3000",
      // "wss://192.168.1.24:3030"
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
      secure: true,
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
      secure: true,
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days,
      domain: "localhost"
    }
  });
}

const getContextFromHttpRequest = async (req: any, res: any) => {
  if (req && req.session) {
    const { userId } = req.session;
    return { userId, req, res };
  }
  return ["No session detected"];
};

const getContextFromSubscription = (connection: any) => {
  const { userId } = connection.context.req.session;
  return { userId, req: connection.context.req };
};

const startServer = async () => {
  let schema: any = await createSchema()
    .then(data => data)
    .catch(error =>
      console.error("Error running createSchema function", error)
    );

  await createConnection(ormConnection);

  const app = Express();

  // const sessionMiddleware = session({
  //   secret: "asdjlfkaasdfkjlads",
  //   resave: false,
  //   saveUninitialized: false
  // });

  app.use(sessionMiddleware);

  // app.use(logger);

  // app.use("/graphql", (req, res, next) => {
  //   const startHrTime = process.hrtime();
  //   res.on("finish", () => {
  //     if (req.body && req.body.operationName) {
  //       const elapsedHrTime = process.hrtime(startHrTime);
  //       const elapsedTimeInMs =
  //         elapsedHrTime[0] * 1000 + elapsedHrTime[1] / 1e6;
  //       req.log.info({
  //         type: "timing",
  //         name: req.body.operationName,
  //         ms: elapsedTimeInMs
  //       });
  //     }
  //   });
  //   next();
  // });

  const server = new ApolloServer({
    introspection: true,
    playground: { version: "1.7.25", endpoint: "/graphql" }, // 1.7.10
    schema,

    context: ({ req, res, connection }: any) => {
      if (connection) {
        return getContextFromSubscription(connection);
      }

      return getContextFromHttpRequest(req, res);

      // return { req, res, connection }
    },
    subscriptions: {
      path: "/subscriptions",
      onConnect: (_, ws: any) => {
        return new Promise(res =>
          sessionMiddleware(ws.upgradeReq, {} as any, () => {
            res({ req: ws.upgradeReq });
          })
        );
      }
    },
    formatError: (error: GraphQLError): GraphQLFormattedError => {
      const { extensions = {}, locations, message, path } = error;

      if (message.includes("Not authenticated")) {
        return error;
      }

      if (error.originalError instanceof ApolloError) {
        return error;
      }

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

      let getStacktrace = extensions.exception
        ? extensions.exception.stacktrace[0].replace("Error: ", "")
        : "Undetermined error";

      return {
        message: getStacktrace,
        path,
        locations
        // extensions
      };
    }
  });

  // app.use(cors(corsOptions))

  server.applyMiddleware({
    app,
    cors: corsOptions
  }); // app is from an existing express app

  let httpServer;

  let httpsServer;

  if (nodeEnvIsProd) {
    httpServer = http.createServer(app);
    server.installSubscriptionHandlers(httpServer);
  } else {
    httpsServer = https.createServer(certOptions, app);
    server.installSubscriptionHandlers(httpsServer);
  }

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

  if (nodeEnvIsProd && httpServer) {
    httpServer.listen({ port }, () =>
      console.log(
        message
        // `🚀 Server ready at http://${devHost}:${devPort}${server.graphqlPath}`
      )
    );
  } else if (nodeEnvIs_NOT_Prod && httpsServer) {
    httpsServer.listen({ port }, () =>
      console.log(
        message
        // `🚀 Server ready at http://${devHost}:${devPort}${server.graphqlPath}`
      )
    );
  }
};

startServer();
