import Code, { CodeDescription } from "../constants/Code";

export type ApiResponseError = CodeDescription;

class ResponseMetadata {
  public status: number;
  public message: string;
  public success: boolean;
  public error?: ApiResponseError;

  constructor(
    status: number,
    message: string,
    success?: boolean,
    error?: ApiResponseError,
  ) {
    this.status = status;
    this.message = message;
    this.success = success === undefined || success === null ? true : success;
    if (error && this.error) {
      this.error.code = error.code;
      this.error.message = error.message;
    }
  }
}

export interface ApiResponse<T> {
  metadata: ResponseMetadata; // http response meta
  data: T | null;
  timestamp: number;
}

export class CoreApiResponse<T = unknown> implements ApiResponse<T> {
  public readonly metadata: ResponseMetadata;
  public readonly data: T;
  public readonly timestamp: number;

  constructor(
    status: number,
    message: string,
    success: boolean,
    data?: T,
    error?: ApiResponseError,
    timestamp?: number,
  ) {
    this.metadata = new ResponseMetadata(status, message, success, error);
    if (data) this.data = data;
    this.timestamp = timestamp || Date.now();
  }

  public static success<T>(data?: T, status?: number) {
    const _status = status !== undefined ? status : Code.SUCCESS.code;
    return new CoreApiResponse<T>(_status, Code.SUCCESS.message, true, data);
  }

  public static error<T>(error?: ApiResponseError, status?: number, data?: T) {
    const _status = status !== undefined ? status : Code.INTERNAL_ERROR.code;
    const _err = error?.message || Code.INTERNAL_ERROR.message;
    return new CoreApiResponse<T>(_status, _err, false, data);
  }
}
