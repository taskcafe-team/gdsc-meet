import { CoreApiResponse } from "@core/common/api/CoreApiResponse";
import { ErrorDto } from "@core/common/dtos/ErrorDto";
import { AppException } from "@core/common/exception/AppException";
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

    errorResponse = this.handleNestError(error, errorResponse, response);
    errorResponse = this.handleCoreException(error, errorResponse, response);

    if (this.configService.get("API_LOG_ENABLE")) {
      const message: string =
        `Method: ${request.method}; ` +
        `Path: ${request.path}; ` +
        `Error: ${
          errorResponse.metadata.error
            ? errorResponse.getErrorDisplay()
            : error.message
        }`;

      Logger.error(message);
    }

    response.json(errorResponse);
  }

  private handleNestError(
    error: Error,
    errorResponse: CoreApiResponse<unknown>,
    response: Response,
  ): CoreApiResponse<unknown> {
    if (error instanceof HttpException) {
      response.status(error.getStatus());
      return CoreApiResponse.error(error.getStatus(), error.message);
    }
    return errorResponse;
  }

  private handleCoreException(
    error: Error,
    errorResponse: CoreApiResponse<unknown>,
    response: Response,
  ): CoreApiResponse<unknown> {
    if (error instanceof AppException) {
      response.status(error.getHttpStatus());
      const errorDto = new ErrorDto(
        error.getCode(),
        error.getMessage(),
        error.getAcction(),
        error.getTitle(),
        error.getErrorType(),
      );
      return CoreApiResponse.error(error.getHttpStatus(), errorDto);
    } else if (error.name === "TokenExpiredError") {
      response.status(HttpStatus.UNAUTHORIZED);
      return CoreApiResponse.error(
        HttpStatus.UNAUTHORIZED,
        "Token expired error",
      );
    }
    return errorResponse;
  }
}
