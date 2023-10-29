import Code from "../constants/Code";
import { Exception } from "../exception/Exception";

export interface ApiResponseError {
  code: string;
  message: string;
}

class ResponseMetadata {
  public status: number;
  public message: string;
  public success: boolean;
  public error?: Exception;

  constructor(
    status: number,
    message: string,
    success?: boolean,
    error?: Exception,
  ) {
    this.status = status;
    this.message = message;
    this.success = success === undefined || success === null ? true : success;
    this.error = error;
  }
}

export interface ApiResponse<T> {
  metadata: ResponseMetadata; // http response meta
  data: T | null;
  timestamp: number;
}

export class CoreApiResponse<T> implements ApiResponse<T> {
  public readonly metadata: ResponseMetadata;
  public readonly data: T | null;
  public readonly timestamp: number;

  constructor(
    status: number,
    data: T | null,
    message: string,
    success: boolean,
    error?: Exception,
    timestamp?: number,
  ) {
    this.metadata = new ResponseMetadata(status, message, success, error);
    this.data = data;
    this.timestamp = timestamp || Date.now();
  }

  public static success<T>(data: T | null = null, status?: number) {
    const _status = status !== undefined ? status : Code.SUCCESS.code;
    return new CoreApiResponse<T>(_status, data, Code.SUCCESS.message, true);
  }

  public static error(error?: Exception, status?: number) {
    const _status = status !== undefined ? status : Code.INTERNAL_ERROR.code;
    return new CoreApiResponse(
      _status,
      error?.data,
      error?.message || Code.INTERNAL_ERROR.message,
      true,
    );
  }
}
