import { CoreApiResponse } from "@core/common/api/CoreApiResponse";
import { Code } from "@core/common/code/Code";
import { Exception } from "@core/common/exception/Exception";
import { EnvironmentVariablesConfig } from "@infrastructure/config/EnvironmentVariablesConfig";
import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  Injectable,
  Logger,
  UnauthorizedException,
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
    let errorResponse: CoreApiResponse<unknown> = CoreApiResponse.error(
      Code.INTERNAL_ERROR.code,
      error.message,
    );

    errorResponse = this.handleNestError(error, errorResponse);
    errorResponse = this.handleCoreException(error, errorResponse);

    if (this.configService.get("API_LOG_ENABLE")) {
      const message: string =
        `Method: ${request.method}; ` +
        `Path: ${request.path}; ` +
        `Error: ${errorResponse.message}`;

      Logger.error(message);
    }

    response.json(errorResponse);
  }

  private handleNestError(
    error: Error,
    errorResponse: CoreApiResponse<unknown>,
  ): CoreApiResponse<unknown> {
    if (error instanceof HttpException) {
      errorResponse = CoreApiResponse.error(
        error.getStatus(),
        error.message,
        null,
      );
    }
    if (error instanceof UnauthorizedException) {
      errorResponse = CoreApiResponse.error(
        Code.UNAUTHORIZED_ERROR.code,
        Code.UNAUTHORIZED_ERROR.message,
        null,
      );
    }

    if (error.name === "TokenExpiredError")
      errorResponse = CoreApiResponse.error(401, error.message);

    return errorResponse;
  }

  private handleCoreException(
    error: Error,
    errorResponse: CoreApiResponse<unknown>,
  ): CoreApiResponse<unknown> {
    if (error instanceof Exception) {
      errorResponse = CoreApiResponse.error(
        error.code,
        error.message,
        error.data,
      );
    }

    return errorResponse;
  }
}
