import { NextFunction, Request, Response } from "express";
import logger from "pino";

export const loggerFunc = (req: Request, res: Response, next: NextFunction) => {
  const startHrTime = process.hrtime();
  res.on("finish", () => {
    if (req.body && req.body.operationName) {
      const elapsedHrTime = process.hrtime(startHrTime);
      const elapsedTimeInMs = elapsedHrTime[0] * 1000 + elapsedHrTime[1] / 1e6;
      console.log(`timing ${req.body.operationName}`, elapsedTimeInMs);
      logger().info({
        type: "timing",
        name: req.body.operationName,
        ms: elapsedTimeInMs
      });
    }
  });
  next();
};
