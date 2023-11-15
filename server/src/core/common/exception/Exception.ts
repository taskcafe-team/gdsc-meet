import Code, { CodeDescription } from "@core/common/constants/Code";

/**
 * Custom exception class that extends Error.
 * @template T - The type of additional data associated with the exception.
 */
export class Exception<T> extends Error {
  /**
   * HTTP status code associated with the exception.
   */
  public readonly status: number;

  /**
   * Additional data associated with the exception.
   */
  public readonly data?: T;

  /**
   * Constructs a new instance of the Exception class.
   * @param codeOrMessage - Either a string code or a CodeDescription object.
   * @param overwriteMessage - An optional custom message to override the default message.
   * @param status - An optional HTTP status code (default is 500).
   * @param data - Additional data to associate with the exception.
   */
  constructor(
    codeOrMessage?: string | CodeDescription<string>,
    overwriteMessage?: string | null,
    status?: number | null,
    data?: T | null,
  ) {
    super();
    if (typeof codeOrMessage === "string") {
      this.name = `${codeOrMessage}`;
      this.message = overwriteMessage || "";
      this.status = status || 500;
    } else if (
      typeof codeOrMessage === "object" &&
      codeOrMessage?.code &&
      codeOrMessage?.message
    ) {
      this.name = `${codeOrMessage.code}`;
      this.message = overwriteMessage || codeOrMessage.message;
      this.status = status || 500;
      this.data = data ?? undefined;
    } else {
      this.name = Code.INTERNAL_ERROR.code;
      this.message = Code.INTERNAL_ERROR.message;
      this.status = 500;
    }

    Error.captureStackTrace(this, this.constructor);
  }
}
