// import AggregateError from "aggregate-error";
import connectRedis from "connect-redis";
import session from "express-session";
import { v4 } from "internal-ip";

import { redisSessionPrefix } from "./constants";
import { xHeaderMiddleware } from "./middleware.x-header";
import { redis } from "./redis";
import { AppServerConfigProps, EnvKeyProps } from "./types/Config";

const devHost = v4.sync(); // "localhost";

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
    graphqlEnpoint: process.env.GQL_ENDPOINT || "not defined",
    nodeEnv: process.env.NODE_ENV || "not defined",
    origin: process.env.PRODUCTION_CLIENT_ORIGIN || "not defined",
    sessionSecret: process.env.SESSION_SECRET || "not defined",
    virtualPort: process.env.VIRTUAL_PORT || "not defined",
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
    throw new Error(undefinedKeys[0]);
  }

  const RedisStore = connectRedis(session);

  if (config.nodeEnv === "production") {
    config.dbString = process.env.PG_CONNECTION_STRING ?? "not defined";
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
        domain: config.domain, // "eddienaff.dev" in prod,
      },
    });
  } else {
    config.domain = devHost;
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
        domain: config.domain, // devHost,
      },
    });
  }

  return config;
}
