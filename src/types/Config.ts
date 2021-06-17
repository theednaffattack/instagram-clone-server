import { RequestHandler } from "express";
import { Connection } from "typeorm";

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
  graphqlEndpoint: string;
  host: string;
  nodeEnv: string;
  origin: string;
  sessionSecret: string;
  virtualPort: string;
  ormConfig: (obj: AppServerConfigProps) => Promise<Connection>;
  sessionMiddleware: RequestHandler;
  xHeaderMiddleware: RequestHandler;
}
