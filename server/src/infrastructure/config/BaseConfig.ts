import { AppErrors } from "@core/common/exception/AppErrors";
import { AppException } from "@core/common/exception/AppException";
import { instanceToPlain } from "class-transformer";
import { validateSync } from "class-validator";

export class BaseConfig {
  protected validate() {
    const errors = validateSync(this);
    if (errors.length > 0)
      throw new AppException(AppErrors.CONFIGURATION_ERROR, errors);
  }

  static getConfig(...args: (new () => BaseConfig)[]) {
    const configsPlain = args.map((config) => {
      const instance = new config();
      instance.validate();
      const plain = instanceToPlain(instance);
      return () => plain;
    });
    return configsPlain;
  }
}
