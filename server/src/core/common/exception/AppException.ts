import { AppCode } from "../constants/AppCode";
import { AppError } from "./AppError";
import { AppErrorAction } from "./AppErrorAction";
import { ErrorType } from "./ErrorType";
import { BaseException } from "./TException";

export class AppException extends BaseException {
  private readonly error: AppError;
  // private readonly args: any[];

  constructor(error: AppError, ...args: any[]) {
    super(error.getMessage(args));
    this.error = error;
  }

  getMessage(): string {
    return this.message;
  }

  getHttpStatus(): number {
    return this.error == null ? 500 : this.error.httpStatus;
  }

  getAcction(): AppErrorAction {
    return this.error.getErrorAction();
  }

  getCode(): string {
    return this.error ? this.error.getCode() : AppCode.INTERNAL_SERVER_ERROR; //TODO: CHECK
  }

  getTitle(): string {
    return this.error.getTitle();
  }

  getErrorType(): ErrorType {
    return this.error.getErrorType();
  }
}
