import { RequestHandler } from "express";

export interface EnvKeyProps {
  [key: string]: string;
}

export interface IIndexable<T = unknown> {
  [key: string]: T;
}

export type CustomUndefined = "not defined";

export interface AppServerConfigProps extends IIndexable {
  api: string;
  cookieDomain: string;
  cookieName: string;
  domain: string;
  dbName: string;
  dbUser: string;
  dbPass: string;
  dbString: string;
  graphqlEnpoint: string;
  nodeEnv: string;
  origin: string;
  sessionSecret: string;
  virtualPort: string;
  sessionMiddleware: RequestHandler;
  xHeaderMiddleware: RequestHandler;
}
