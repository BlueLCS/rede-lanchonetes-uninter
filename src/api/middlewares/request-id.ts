import { randomUUID } from "node:crypto";
import { NextFunction, Request, Response } from "express";

function requestId(
  request: Request,
  response: Response,
  next: NextFunction
) {
  const receivedId = request.get("x-request-id");
  const currentId = receivedId?.trim() || randomUUID();

  response.locals.requestId = currentId;
  response.setHeader("x-request-id", currentId);

  next();
}

export { requestId };