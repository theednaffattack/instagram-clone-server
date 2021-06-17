import { NextFunction, Request, Response } from "express";

export function xHeaderMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (req.header("x-forwarded-proto") !== "https") {
    res.redirect("https://" + req.header("host") + req.url);
  } else {
    next();
  }
}
