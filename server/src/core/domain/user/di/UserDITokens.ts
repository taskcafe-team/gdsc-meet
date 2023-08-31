export class UserDITokens {
  // Service
  public static readonly UserUsecase: unique symbol = Symbol("UserUsecase");

  // Handlers
  public static readonly GetUserPreviewQueryHandler: unique symbol = Symbol(
    "GetUserPreviewQueryHandler",
  );

  // Repositories
  public static readonly UserRepository: unique symbol =
    Symbol("UserRepository");
}
