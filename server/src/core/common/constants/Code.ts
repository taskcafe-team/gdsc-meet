export interface CodeDescription<T = string | number> {
  code: T;
  message: string;
}

export interface OverwriteStatus {
  overwriteStatus: CodeDescription<number>;
}

export default class Code {
  public static SUCCESS: CodeDescription<number> = {
    code: 200,
    message: "Success.",
  };

  public static BAD_REQUEST_ERROR: CodeDescription<number> = {
    code: 400,
    message: "Bad request.",
  };

  public static UNAUTHORIZED_ERROR: CodeDescription<number> = {
    code: 401,
    message: "Unauthorized error.",
  };

  public static JWT_EXPIRED: CodeDescription<number> = {
    code: 401,
    message: "Token expired",
  };

  public static WRONG_CREDENTIALS_ERROR: CodeDescription<number> = {
    code: 402,
    message: "Wrong Credentials.",
  };

  public static ACCESS_DENIED_ERROR: CodeDescription<number> = {
    code: 403,
    message: "Access denied.",
  };

  public static NOT_FOUND_ERROR: CodeDescription<number> = {
    code: 404,
    message: "Not found.",
  };

  public static CONFLICT_ERROR: CodeDescription<number> = {
    code: 409,
    message: "Conflict detected.",
  };

  public static INTERNAL_ERROR: CodeDescription<number> = {
    code: 500,
    message: "Internal error.",
  };

  public static ENTITY_NOT_FOUND_ERROR: CodeDescription = {
    code: "ENTITY_NOT_FOUND_ERROR",
    message: "Entity not found.",
  };

  public static ENTITY_VALIDATION_ERROR: CodeDescription = {
    code: "ENTITY_VALIDATION_ERROR",
    message: "Entity validation error.",
  };

  public static USE_CASE_PORT_VALIDATION_ERROR: CodeDescription = {
    code: "USE_CASE_PORT_VALIDATION_ERROR",
    message: "Use-case port validation error.",
  };

  public static VALUE_OBJECT_VALIDATION_ERROR: CodeDescription = {
    code: "VALUE_OBJECT_VALIDATION_ERROR",
    message: "Value object validation error.",
  };

  public static ENTITY_ALREADY_EXISTS_ERROR: CodeDescription = {
    code: "1004",
    message: "Entity already exists.",
  };
}
