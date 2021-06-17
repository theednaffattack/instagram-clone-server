import { ApolloServer } from "apollo-server-express";
import "dotenv/config";
import Express from "express";
import http from "http";
import { v4 } from "internal-ip";
import "reflect-metadata";
import { createConnection } from "typeorm";
import { PostgresConnectionOptions } from "typeorm/driver/postgres/PostgresConnectionOptions";
import { formatGraphQLError } from "./config.format-graphql-errors";
import { configGraphQLSubscriptions } from "./config.subscriptions";
import { createSchema } from "./global-utils/createSchema";
import { timingMiddleware } from "./middleware.timing";
import { AppServerConfigProps } from "./types/Config";

// const nodeEnvIsDev = process.env.NODE_ENV === "development";
const nodeEnvIsProd = process.env.NODE_ENV === "production";
const nodeEnvIs_NOT_Prod = process.env.NODE_ENV !== "production";

const devPort = "4000";

const port = nodeEnvIsProd ? process.env.PORT : devPort;

const devHost = v4.sync(); // "localhost";

const prodHost = process.env.PRODUCTION_HOST;

const host = nodeEnvIsProd
  ? `https://${prodHost}/graphql`
  : `http://${devHost}:${port}/graphql`;

let allowedOrigins = nodeEnvIs_NOT_Prod
  ? [
      host,
      // `https://${process.env.PRODUCTION_CLIENT_ORIGIN}`, // FRONT END - DEV
      `http://${devHost}:3050`, // FRONT END -DEV
      `http://${devHost}:3055`, // OLD FRONT END TEST
      `ws://${devHost}:${port}`, // GQL SERVER WS
      `http://${devHost}:4000`, // GQL SERVER
    ]
  : [
      `https://${prodHost}`, //
      `https://${process.env.PRODUCTION_CLIENT_ORIGIN}`, // FRONT END - PROD
      `wss://${process.env.PRODUCTION_CLIENT_ORIGIN}`, // /subscription,
    ];

console.log("\n\nALLOWED ORIGINS", allowedOrigins);

const corsOptions = {
  credentials: true,
  origin: function(origin: any, callback: any) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.error("cors error:: origin: ", { origin, allowedOrigins });
    }
  },
};

// const RedisStore = connectRedis(session);

// // let sessionMiddleware: Express.RequestHandler;

// // needed to remove domain from our cookie
// // in non-production environments
// if (nodeEnvIsProd) {
//   sessionMiddleware = session({
//     name: COOKIE_NAME,
//     secret: process.env.SESSION_SECRET as string,
//     store: new RedisStore({
//       client: redis as any,
//       prefix: redisSessionPrefix,
//     }),
//     resave: false,
//     saveUninitialized: false,
//     cookie: {
//       httpOnly: true,
//       secure: true,
//       maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days,
//       domain: "eddienaff.dev",
//     },
//   });
// }

// if (nodeEnvIsDev || nodeEnvIs_NOT_Prod) {
//   sessionMiddleware = session({
//     name: COOKIE_NAME,
//     secret: process.env.SESSION_SECRET as string,
//     store: new RedisStore({
//       client: redis as any,
//       prefix: redisSessionPrefix,
//     }),
//     resave: false,
//     saveUninitialized: false,
//     cookie: {
//       httpOnly: true,
//       secure: false,
//       maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days,
//       domain: "10.0.0.188", // devHost,
//     },
//   });
// }

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

export async function startServer(configObj: AppServerConfigProps) {
  let schema;

  try {
    schema = await createSchema();
  } catch (error) {
    console.warn("ERROR CREATING SCHEMA", error);
  }

  try {
    const devOrmconfig: PostgresConnectionOptions = {
      name: "default",
      type: "postgres",
      // host: "localhost",
      // port: 5432,
      ssl: false,
      // username: "eddienaff",
      url: configObj.dbString,
      // password: "eddienaff",
      // database: "instagram_clone",
      logging: false,
      synchronize: true,
      entities: ["src/entity/**/*.ts"],
      migrations: ["src/migration/**/*.ts"],
      subscribers: ["src/subscriber/**/*.ts"],
      cli: {
        entitiesDir: "dist/entity",
        migrationsDir: "src/migration",
        subscribersDir: "src/subscriber",
      },
    };

    await createConnection(devOrmconfig);
  } catch (error) {
    console.warn("ERROR CREATING DB CONNECTION", error);
  }
  const app = Express();

  app.use(configObj.sessionMiddleware);

  app.use(configObj.graphqlEnpoint, timingMiddleware);

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
    subscriptions: configGraphQLSubscriptions(configObj),
    // {
    //   path: "/subscriptions",
    //   onConnect: (_, ws: any) => {
    //     return new Promise(
    //       (res) =>
    //         configObj.sessionMiddleware(ws.upgradeReq, {} as any, () => {
    //           res({ req: ws.upgradeReq });
    //         })
    //       // sessionMiddleware(ws.upgradeReq, {} as any, () => {
    //       //   res({ req: ws.upgradeReq });
    //       // })
    //     );
    //   },
    // },
    formatError: formatGraphQLError,
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
  if (configObj.nodeEnv === "production") {
    app.use(configObj.xHeaderMiddleware);
  }

  httpServer.listen({ port }, () =>
    console.log(
      // message
      `\n\n 🚀 Server ready at ${host}.\n\n`
    )
  );
}

// startServer();
