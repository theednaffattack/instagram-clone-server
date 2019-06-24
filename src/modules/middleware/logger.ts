import { MiddlewareFn } from "type-graphql";

import { MyContext } from "../../types/MyContext";
const { log } = console;

export const logger: MiddlewareFn<MyContext> = async ({ args }, next) => {
  // @todo: introduce windston logger here.
  log("=== logger middleware ===");
  log("args", args);

  return next();
};
