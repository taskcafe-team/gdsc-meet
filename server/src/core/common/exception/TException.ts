export abstract class BaseException extends Error {
  public readonly message: string;
  constructor(message: string) {
    super(message);
  }

  abstract getHttpStatus(): number;
  abstract getCode(): string;
  abstract getMessage(): string;
  abstract getAcction(): string;
  abstract getTitle(): string;
  abstract getErrorType(): string;
}
