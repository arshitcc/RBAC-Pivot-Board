import mongoose from "mongoose";
import { ErrorRequestHandler, NextFunction, Request, Response } from "express";
import logger from "../loggers/winston.logger";
import { ApiError } from "../utils/api-error";
import { removeUnusedMulterImageFilesOnError } from "../utils/helpers";

const errorHandler : ErrorRequestHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  let error = err;

  if (!(error instanceof ApiError)) {
    const statusCode =
      error.statusCode || error instanceof mongoose.Error ? 400 : 500;

    const message = error.message || "Something went wrong";
    error = new ApiError(statusCode, message, error?.errors || [], err.stack);
  }

  const response = {
    ...error,
    message: error.message,
    ...(process.env.NODE_ENV === "development" ? { stack: error.stack } : {}),
  };

  logger.error(`${error.message}`);

  removeUnusedMulterImageFilesOnError(req);
  res.status(error.statusCode).json(response);
  return;
};

export { errorHandler };
