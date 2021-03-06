import { MiddlewareFn } from "type-graphql";
import { MyContext } from "../../types/MyContext";

export const isAuth: MiddlewareFn<MyContext> = async ({ context }, next) => {
  // if (!context.req.session!.userId && !context.userId) {
  if (!context.userId) {
    throw new Error("Not authenticated");
  }
  return next();
};
