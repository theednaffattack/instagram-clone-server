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
import { v4 } from "internal-ip";

import logger from "pino";

import { createSchema } from "./global-utils/createSchema";
import { redis } from "./redis";
import { COOKIE_NAME, redisSessionPrefix } from "./constants";
import { devOrmconfig } from "./dev_ormconfig";
import { productionOrmConfig } from "./production_ormconfig";

const nodeEnvIsDev = process.env.NODE_ENV === "development";
const nodeEnvIsProd = process.env.NODE_ENV === "production";
const nodeEnvIs_NOT_Prod = process.env.NODE_ENV !== "production";

const devPort = "4000";

const port = nodeEnvIsProd ? process.env.PORT : devPort;

const devHost = v4.sync(); // "localhost";

const prodHost = process.env.PRODUCTION_HOST;

const host = nodeEnvIsProd
  ? `https://${prodHost}/graphql`
  : `http://${devHost}:${port}/graphql`;

const ormConnection = nodeEnvIsDev ? devOrmconfig : productionOrmConfig;

let allowedOrigins = nodeEnvIs_NOT_Prod
  ? [
      host,
      `https://${process.env.PRODUCTION_CLIENT_ORIGIN}`, // FRONT END
      `http://${devHost}:3050`, // FRONT END
      `http://${devHost}:3055`, // OLD FRONT END TEST
      `ws://${devHost}:${port}`, // GQL SERVER WS
      `http://${devHost}:4000`, // GQL SERVER
    ]
  : [
      // "https://faux-gram-client-nextjs.herokuapp.com", // prod frontend
      // "https://eddie-faux-gram.herokuapp.com", // prod backend
      // "https://fauxgramapp.eddienaff.dev", // public frontend
      // "https://fauxgramapi.eddienaff.dev", // public backend
      // "wss://eddie-faux-gram.herokuapp.com",
      // "wss://fauxgramapp.eddienaff.dev",
      // "wss://fauxgramapi.eddienaff.dev",
    ];

const corsOptions = {
  credentials: true,
  origin: function(origin: any, callback: any) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.error("cors error:: origin: ", origin);
    }
  },
};

const RedisStore = connectRedis(session);

let sessionMiddleware: Express.RequestHandler;

// needed to remove domain from our cookie
// in non-production environments
if (nodeEnvIsProd) {
  sessionMiddleware = session({
    name: COOKIE_NAME,
    secret: process.env.SESSION_SECRET as string,
    store: new RedisStore({
      client: redis as any,
      prefix: redisSessionPrefix,
    }),
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: true,
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days,
      domain: "eddienaff.dev",
    },
  });
}

if (nodeEnvIsDev || nodeEnvIs_NOT_Prod) {
  sessionMiddleware = session({
    name: COOKIE_NAME,
    secret: process.env.SESSION_SECRET as string,
    store: new RedisStore({
      client: redis as any,
      prefix: redisSessionPrefix,
    }),
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false,
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days,
      domain: "10.0.0.188", // devHost,
    },
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
  let schema;
  try {
    schema = await createSchema();
  } catch (error) {
    console.warn("ERROR CREATING SCHEMA", error);
  }

  try {
    await createConnection(ormConnection);
  } catch (error) {
    console.warn("ERROR CREATING DB CONNECTION", error);
  }
  const app = Express();

  app.use(sessionMiddleware);

  app.use("/graphql", (req, res, next) => {
    const startHrTime = process.hrtime();
    res.on("finish", () => {
      if (req.body && req.body.operationName) {
        const elapsedHrTime = process.hrtime(startHrTime);
        const elapsedTimeInMs =
          elapsedHrTime[0] * 1000 + elapsedHrTime[1] / 1e6;
        console.log(`timing ${req.body.operationName}`, elapsedTimeInMs);
        logger().info({
          type: "timing",
          name: req.body.operationName,
          ms: elapsedTimeInMs,
        });
      }
    });
    next();
  });

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
        return new Promise((res) =>
          sessionMiddleware(ws.upgradeReq, {} as any, () => {
            res({ req: ws.upgradeReq });
          })
        );
      },
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
        // Add a custom error code
        extensions.code = "GRAPHQL_VALIDATION_FAILED";
        // Strip off the validation erros created by
        // decorator-style field validators.
        const { validationErrors } = extensions.exception;
        const valErrorsCache = [];

        // Loop over the validation errors and
        // create a custom error shape that's easier to
        // digest later.
        for (const error of validationErrors) {
          valErrorsCache.push({
            field: error.property,
            message: Object.values(error.constraints)[0],
          });
        }

        // Add the new error shape to extensions.
        extensions.valErrors = valErrorsCache;

        return {
          extensions,
          locations,
          message,
          path,
        };
      }

      //   error.message = "Internal Server Error";

      let getStacktrace = extensions.exception
        ? extensions.exception.stacktrace[0].replace("Error: ", "")
        : "Undetermined error";

      return {
        message: getStacktrace,
        path,
        locations,
        // extensions
      };
    },
  });

  // app.use(cors(corsOptions))

  server.applyMiddleware({
    app,
    cors: corsOptions,
  }); // app is from an existing express app

  const httpServer = http.createServer(app);
  server.installSubscriptionHandlers(httpServer);

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

  httpServer.listen({ port }, () =>
    console.log(
      // message
      `\n\n 🚀 Server ready at ${host}.\n\n`
    )
  );
};

startServer();
