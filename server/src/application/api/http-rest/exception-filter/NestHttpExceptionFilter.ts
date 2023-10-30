import { CoreApiResponse } from "@core/common/api/CoreApiResponse";
import Code, { OverwriteStatus } from "@core/common/constants/Code";
import { Exception } from "@core/common/exception/Exception";
import { EnvironmentVariablesConfig } from "@infrastructure/config/EnvironmentVariablesConfig";
import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  Injectable,
  Logger,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Request, Response } from "express";

@Injectable()
@Catch()
export class NestHttpExceptionFilter implements ExceptionFilter {
  constructor(
    private readonly configService: ConfigService<EnvironmentVariablesConfig>,
  ) {}

  public catch(error: Error, host: ArgumentsHost): void {
    const request: Request = host.switchToHttp().getRequest();
    const response: Response = host.switchToHttp().getResponse<Response>();
    let errorResponse = CoreApiResponse.error();

    errorResponse = this.handleNestError(error, errorResponse);
    errorResponse = this.handleCoreException(error, errorResponse);

    if (this.configService.get("API_LOG_ENABLE")) {
      const message: string =
        `Method: ${request.method}; ` +
        `Path: ${request.path}; ` +
        `Error: ${errorResponse.metadata.error?.message}`;

      Logger.error(message);
    }

    response.json(errorResponse);
  }

  private handleNestError(
    error: Error,
    errorResponse: CoreApiResponse<unknown>,
  ): CoreApiResponse<unknown> {
    if (error instanceof HttpException) {
      errorResponse.metadata.status = error.getStatus();
      errorResponse.metadata.success = false;
      errorResponse.metadata.message = error.message;
    }

    return errorResponse;
  }

  private handleCoreException(
    error: Error,
    errorResponse: CoreApiResponse<unknown>,
  ): CoreApiResponse<unknown> {
    if (error instanceof Exception) {
      const { code, message } = error;
      errorResponse.metadata.error = { code, message };

      if (error.data && "overwriteStatus" in error.data) {
        const { overwriteStatus } = error.data as OverwriteStatus;
        if (overwriteStatus) {
          const { code, message } = overwriteStatus;
          if (code && message) {
            errorResponse.metadata;
            errorResponse.metadata.message = overwriteStatus.message;
          }
        }
      }
      if (typeof error.code === "number")
        errorResponse.metadata.status = error.code;
    } else if (error.name === "TokenExpiredError") {
      errorResponse = CoreApiResponse.error(Code.JWT_EXPIRED);
    }

    return errorResponse;
  }
}
