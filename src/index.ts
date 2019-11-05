import "reflect-metadata";
import "dotenv/config";
import { createConnection } from "typeorm";
import { ApolloServer, ApolloError } from "apollo-server-express";
import Express from "express";
import session from "express-session";
import http from "http";
import connectRedis from "connect-redis";
// import cors from "cors";

import { createSchema } from "./global-utils/createSchema";
import { ArgumentValidationError } from "type-graphql";
import { GraphQLFormattedError, GraphQLError } from "graphql";
import { redis } from "./redis";
import { redisSessionPrefix } from "./constants";
import { devOrmconfig } from "./dev_ormconfig";
import { productionOrmConfig } from "./production_ormconfig";

const nodeEnvIsDev = process.env.NODE_ENV === "development";
const nodeEnvIsProd = process.env.NODE_ENV === "production";
const nodeEnvIs_NOT_Prod = process.env.NODE_ENV !== "production";

const port = nodeEnvIsProd ? process.env.PORT : "4000";

const ormConnection = nodeEnvIsDev ? devOrmconfig : productionOrmConfig;

const allowedOrigins = [
  "https://faux-gram-client-nextjs.herokuapp.com", // prod
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
  "ws://192.168.1.24:3000"
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

  const devHost = "192.168.1.24";

  const devPort = "4000";

  const server = new ApolloServer({
    introspection: true,
    playground: true,
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

      console.log(error);

      //   error.message = "Internal Server Error";

      return {
        message: extensions.exception.stacktrace[0].replace("Error: ", ""),
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
      `🚀 Server ready at http://${devHost}:${devPort}${server.graphqlPath}`
    )
  );
};

startServer();
