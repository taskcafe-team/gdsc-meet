import { ErrorDto } from "../dtos/ErrorDto";
import { AppError } from "../exception/AppError";

export class ApiResponseMetadata {
  public readonly status: number;
  public readonly success: boolean;
  public readonly message?: string;
  public readonly error?: ErrorDto;

  constructor(
    status: number,
    messageOrError: string | ErrorDto,
    success?: boolean,
  ) {
    this.status = status;
    if (typeof messageOrError === "string") {
      this.message = messageOrError;
      this.success = success ?? true;
    } else if (messageOrError instanceof ErrorDto) {
      this.error = messageOrError;
      this.success = false;
    } else this.success = true;
  }
}

export type TCoreApiResponse<T> = {
  metadata: ApiResponseMetadata;
  data?: T;
};

export class CoreApiResponse<T = undefined> implements TCoreApiResponse<T> {
  readonly metadata: ApiResponseMetadata;
  readonly data?: T;

  private constructor(
    status: number,
    messageOrError: string | ErrorDto,
    data?: T,
    success?: boolean,
  ) {
    this.metadata = new ApiResponseMetadata(status, messageOrError, success);
    if (data) this.data = data;
  }

  getErrorDisplay(): string {
    if (this.metadata.message) return this.metadata.message;
    else if (this.metadata.error) {
      const error = this.metadata.error;
      return `${error.code}:${error.message}`;
    } else return "";
  }

  public static success<T>(data?: T, status?: number) {
    return new CoreApiResponse(status ?? 200, "Success", data, true);
  }

  public static appError<T>(appError: AppError, data?: T): CoreApiResponse<T> {
    return new CoreApiResponse(appError.getHttpStatus(), appError, data, false);
  }

  public static error<T>(
    status?: number,
    messageOrError?: string | ErrorDto,
    data?: T,
  ) {
    return new CoreApiResponse(
      status ?? 500,
      messageOrError ?? "Intenal Server Error",
      data,
      false,
    );
  }
}
