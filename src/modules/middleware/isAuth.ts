import { MiddlewareFn } from "type-graphql";
import { MyContext } from "../../types/MyContext";

export const isAuth: MiddlewareFn<MyContext> = async ({ context }, next) => {
  if (!context.req.session!.userId && !context.userId) {
    console.error("isAuth error");
    console.log("VIEW CONTEXT");
    console.log(context.req.session);
    console.log(context.userId);
    throw new Error("Not authenticated");
  } else {
    // const { userId } = context.req.session;
    // const userId = context.req.session ? context.req.session.userId : null;
  }
  return next();
};
