import { CodeDescription } from "@core/common/constants/Code";
import { Optional } from "@core/common/type/CommonTypes";

export type CreateExceptionPayload<T> = {
  code: CodeDescription;
  overrideMessage?: string;
  data?: T;
};

export class Exception<T = unknown> extends Error {
  public readonly code: string;
  public readonly data: Optional<T>;
  public readonly message: string;

  private constructor(code: string, message?: string, data?: T) {
    super();
    this.name = this.constructor.name;
    this.code = code;
    this.data = data;
    if (message) this.message = message;
    Error.captureStackTrace(this, this.constructor);
  }

  public static new<T>(code: string, message?: string, data?: T): Exception<T> {
    return new Exception(code, message, data);
  }

  public static newFromCode<T>(
    codeDescription: CodeDescription,
    data?: T,
  ): Exception<T> {
    const strCode = codeDescription.code;
    return new Exception(`${strCode}`, codeDescription.message, data);
  }
}
