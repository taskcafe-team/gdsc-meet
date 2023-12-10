import { AppCode } from "../constants/AppCode";
import { AppError } from "./AppError";
import { AppErrorAction } from "./AppErrorAction";
import { ErrorType } from "./ErrorType";

export type TAppErrorCode = Omit<
  { [K in keyof typeof AppCode]: AppError },
  "SUCCESS"
>;
export const AppErrors: TAppErrorCode = {
  INVALID_PARAMETER: new AppError(
    400,
    AppCode.INVALID_PARAMETER,
    "Please enter a valid parameter {0}.",
    AppErrorAction.DEFAULT,
    "Invalid parameter",
    ErrorType.AUTHENTICATION_ERROR,
  ),
  VALIDATION_FAILURE: new AppError(
    402,
    AppCode.VALIDATION_FAILURE,
    "Validation Failure(s): {0}",
    AppErrorAction.DEFAULT,
    "Validation failed",
    ErrorType.INTERNAL_ERROR,
  ),
  UNAUTHORIZED_ACCESS: new AppError(
    403,
    AppCode.UNAUTHORIZED_ACCESS,
    "Unauthorized access",
    AppErrorAction.DEFAULT,
    "Unauthorized access",
    ErrorType.AUTHENTICATION_ERROR,
  ),
  INTERNAL_SERVER_ERROR: new AppError(
    500,
    AppCode.INTERNAL_SERVER_ERROR,
    "Internal server error while processing request",
    AppErrorAction.DEFAULT,
    "Internal server error",
    ErrorType.INTERNAL_ERROR,
  ),
  CONFIGURATION_ERROR: new AppError(
    500,
    AppCode.CONFIGURATION_ERROR,
    "Configuration error: {0}",
    AppErrorAction.LOG_EXTERNALLY,
    "Configuration error",
    ErrorType.INTERNAL_ERROR,
  ),
  ENTITY_NOT_FOUND_ERROR: new AppError(
    500,
    AppCode.ENTITY_NOT_FOUND_ERROR,
    "Entity not found: {0}",
    AppErrorAction.DEFAULT,
    "Entity not found",
    ErrorType.ARGUMENT_ERROR,
  ),
};
