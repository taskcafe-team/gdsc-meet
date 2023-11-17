import { CoreApiResponse } from "@core/common/api/CoreApiResponse";
import Code from "@core/common/constants/Code";
import { Exception } from "@core/common/exception/Exception";
import { EnvironmentVariablesConfig } from "@infrastructure/config/EnvironmentVariablesConfig";
import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
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
    errorResponse = this.handleCoreException(error, errorResponse, response);

    if (this.configService.get("API_LOG_ENABLE")) {
      const message: string =
        `Method: ${request.method}; ` +
        `Path: ${request.path}; ` +
        `Error: ${errorResponse.error?.message ?? error.message}`;

      Logger.error(message);
    }

    response.json(errorResponse);
  }

  private handleNestError(
    error: Error,
    errorResponse: CoreApiResponse<unknown>,
  ): CoreApiResponse<unknown> {
    if (error instanceof HttpException) {
      errorResponse = CoreApiResponse.error({
        code: error.getStatus(),
        message: error.message,
      });
    }

    return errorResponse;
  }

  private handleCoreException(
    error: Error,
    errorResponse: CoreApiResponse<unknown>,
    response: Response,
  ): CoreApiResponse<unknown> {
    if (error instanceof Exception) {
      response.status(error.status);

      errorResponse = CoreApiResponse.error({
        code: error.name,
        message: error.message,
      });
    } else if (error.name === "TokenExpiredError") {
      response.status(HttpStatus.UNAUTHORIZED);
      errorResponse = CoreApiResponse.error(Code.JWT_EXPIRED);
    }

    return errorResponse;
  }
}
