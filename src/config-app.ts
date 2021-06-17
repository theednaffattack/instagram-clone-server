// import AggregateError from "aggregate-error";
import connectRedis from "connect-redis";
import session from "express-session";
import { v4 } from "internal-ip";
import { Connection, createConnection } from "typeorm";
import { PostgresConnectionOptions } from "typeorm/driver/postgres/PostgresConnectionOptions";

import { redisSessionPrefix } from "./constants";
import { xHeaderMiddleware } from "./middleware.x-header";
import { redis } from "./redis";
import { AppServerConfigProps, EnvKeyProps } from "./types/Config";

const devHost = v4.sync();

export async function configApp(): Promise<AppServerConfigProps> {
  const envKeys: EnvKeyProps = {
    api: "PRODUCTION_API_ORIGIN",
    cookieDomain: "COOKIE_DOMAIN",
    cookieName: "COOKIE_NAME",
    domain: "DOMAINS",
    dbName: "POSTGRES_DBNAME",
    dbUser: "POSTGRES_USER",
    dbPass: "POSTGRES_PASS",
    dbString: "PG_CONNECTION_STRING",
    graphqlEnpoint: "GQL_ENDPOINT",
    nodeEnv: "NODE_ENV",
    origin: "PRODUCTION_CLIENT_ORIGIN",
    sessionSecret: "SESSION_SECRET",
    virtualPort: "VIRTUAL_PORT",
  };

  // First load everyting that's a simple string from env vars
  const config: AppServerConfigProps = {
    api: process.env.PRODUCTION_API_ORIGIN || "not defined",
    cookieDomain: process.env.COOKIE_DOMAIN || "not defined",
    cookieName: process.env.COOKIE_NAME || "not defined",
    domain: process.env.DOMAINS || "not defined",
    dbName: process.env.POSTGRES_DBNAME || "not defined",
    dbUser: process.env.POSTGRES_USER || "not defined",
    dbPass: process.env.POSTGRES_PASS || "not defined",
    dbString: process.env.DEV_PG_CONNECTION_STRING || "not defined",
    graphqlEndpoint: process.env.GQL_ENDPOINT || "not defined",
    nodeEnv: process.env.NODE_ENV || "not defined",
    origin: process.env.PRODUCTION_CLIENT_ORIGIN || "not defined",
    sessionSecret: process.env.SESSION_SECRET || "not defined",
    virtualPort: process.env.VIRTUAL_PORT || "not defined",
    // Above are all string value env vars
    ormConfig: async (obj: AppServerConfigProps): Promise<Connection> => {
      const devOrmconfig: PostgresConnectionOptions = {
        name: "default",
        type: "postgres",
        // host: "localhost",
        // port: 5432,
        ssl: false,
        // username: "eddienaff",
        url: obj.dbString,
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

      let newConnection;
      try {
        newConnection = await createConnection(devOrmconfig);
      } catch (error) {
        console.warn("ERROR CREATING DB CONNECTION", error);
        throw Error(error);
      }

      return newConnection;
    },
    sessionMiddleware: () => {},
    xHeaderMiddleware: xHeaderMiddleware,
  };

  // Pull the entries from config
  const configEntries = Object.entries(config);

  // Collect any keys that are undefined from "configEntries"
  const undefinedKeys = [];

  // Loop over the entries check for definition. If any are missing, push
  // onto "undefinedKeys" to later be included in an AggregateError.
  for (const [key, value] of configEntries) {
    if (value === "not defined") {
      undefinedKeys.push(
        `Configuration key "${key}" is undefined. Please check the ${envKeys[key]} enviroment variable.`
      );
    }
  }

  // Throw our prepped error messages for the user.
  if (undefinedKeys.length > 0) {
    for (const errorStatement of undefinedKeys) {
      console.error(errorStatement);
    }
    throw new Error(undefinedKeys[0]);
  }

  const RedisStore = connectRedis(session);

  if (config.nodeEnv === "production") {
    // Override the default which loads the 'DEV' connection
    // string.
    // TODO: create a reusable function to check env variables
    config.dbString = process.env.PG_CONNECTION_STRING ?? "not defined";

    if (config.dbString === "not defined") {
      throw Error(
        `Env variable 'PG_CONNECTION_STRING' is not set, please check your env vars.`
      );
    }

    config.sessionMiddleware = session({
      name: config.cookieName,
      secret: config.sessionSecret,
      store: new RedisStore({
        client: redis as any,
        prefix: redisSessionPrefix,
      }),
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        secure: config.nodeEnv === "production",
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days,
        domain: config.domain,
      },
    });
  } else {
    // Reset the Domain variable (maybe rename to 'host').
    config.domain = devHost;
    // Trap errors when configging the ORM.
    try {
      await config.ormConfig(config);
    } catch (error) {
      console.error(error);
      throw Error(error);
    }

    // Configure the session info here so that we have access to values in
    // 'configObj', rather than setting it immediately when creating the object.
    config.sessionMiddleware = session({
      name: config.cookieName,
      secret: config.sessionSecret,
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
        domain: devHost,
      },
    });
  }

  return config;
}
