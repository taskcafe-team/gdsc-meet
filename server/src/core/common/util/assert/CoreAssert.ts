export class CoreAssert {
  public static isTrue(expression: boolean, exception: Error): void {
    if (!expression) throw exception;
  }

  public static isFalse(expression: boolean, exception: Error): void {
    if (expression) throw exception;
  }

  public static notEmpty<T>(value: T | null | undefined, exception: Error): T {
    if (value === null || value === undefined) throw exception;
    return value;
  }

  public static isEqualObjectValue(obj1: any, obj2: any): boolean {
    return JSON.stringify(obj1) === JSON.stringify(obj2);
  }
}
