import Code, { CodeDescription } from "../constants/Code";

export type ApiResponseError = CodeDescription<string>;

export interface ApiResponse<T> {
  success: boolean;
  error?: ApiResponseError;
  data?: T;
  timestamp: number;
}

export class CoreApiResponse<T = unknown> implements ApiResponse<T> {
  public readonly success: boolean;
  public readonly error?: ApiResponseError;
  public readonly data?: T;
  public readonly timestamp: number;

  constructor(
    success?: boolean,
    data?: T,
    error?: ApiResponseError,
    timestamp?: number,
  ) {
    this.success = success ?? true;
    this.data = data ?? undefined;
    this.error = error ?? undefined;
    this.timestamp = timestamp ?? Date.now();
  }

  public static success<T>(data?: T) {
    return new CoreApiResponse<T>(true, data, Code.SUCCESS);
  }

  public static error<T>(error?: ApiResponseError, data?: T) {
    const _error = error ?? Code.INTERNAL_ERROR;
    return new CoreApiResponse<T>(false, data, _error);
  }
}
