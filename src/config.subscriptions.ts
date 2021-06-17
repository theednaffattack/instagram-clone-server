import { Config } from "apollo-server-express";
import { AppServerConfigProps } from "./types/Config";

export function configGraphQLSubscriptions(
  configObj: AppServerConfigProps
): Config["subscriptions"] {
  return {
    path: "/subscriptions",
    onConnect: (_, ws: any) => {
      return new Promise(
        (res) =>
          configObj.sessionMiddleware(ws.upgradeReq, {} as any, () => {
            res({ req: ws.upgradeReq });
          })
        // sessionMiddleware(ws.upgradeReq, {} as any, () => {
        //   res({ req: ws.upgradeReq });
        // })
      );
    },
  };
}
