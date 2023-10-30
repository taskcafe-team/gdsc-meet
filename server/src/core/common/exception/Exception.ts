import { CodeDescription } from "@core/common/constants/Code";
import { Optional } from "@core/common/type/CommonTypes";

export class Exception<T> extends Error implements CodeDescription {
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

  public static new<T>(
    code: string | CodeDescription,
    message?: string,
    data?: T,
  ): Exception<T> {
    if (typeof code === "string") return new Exception(code, message, data);

    if (typeof code === "object" && code !== null) {
      const codeDescription = code as CodeDescription;
      return new Exception(
        codeDescription.code.toString(),
        codeDescription.message,
        data,
      );
    }
    throw new Error("Invalid input for 'code'");
  }

  public static newFromCode<T>(
    codeDescription: CodeDescription,
    data?: T,
  ): Exception<T> {
    const strCode = codeDescription.code;
    return new Exception(`${strCode}`, codeDescription.message, data);
  }
}
