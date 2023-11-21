import { AppCode } from "../constants/AppCode";
import { AppError } from "./AppError";
import { AppErrorAction } from "./AppErrorAction";
import { ErrorType } from "./ErrorType";

export type TAppErrorCode = Omit<
  { [K in keyof typeof AppCode]: AppError },
  "SUCCESS"
>;
export const AppErrors: TAppErrorCode = {
  VALIDATION_FAILURE: new AppError(
    402,
    AppCode.VALIDATION_FAILURE,
    "Validation Failure(s): {0}",
    AppErrorAction.DEFAULT,
    "Validation failed",
    ErrorType.INTERNAL_ERROR,
  ),
  INTERNAL_SERVER_ERROR: new AppError(
    500,
    AppCode.INTERNAL_SERVER_ERROR,
    "Internal server error while processing request",
    AppErrorAction.DEFAULT,
    "Internal server error",
    ErrorType.ARGUMENT_ERROR,
  ),
  ENTITY_NOT_FOUND_ERROR: new AppError(
    500,
    AppCode.ENTITY_NOT_FOUND_ERROR,
    "Entity not found: {0}",
    AppErrorAction.DEFAULT,
    "Entity not found",
    ErrorType.INTERNAL_ERROR,
  ),
};
