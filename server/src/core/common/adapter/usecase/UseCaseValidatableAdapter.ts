import { AppErrors } from "@core/common/exception/AppErrors";
import { AppException } from "@core/common/exception/AppException";
import { ClassValidator } from "@core/common/util/class-validator/ClassValidator";

export class UseCaseValidatableAdapter {
  public async validate(): Promise<void> {
    const details = await ClassValidator.validate(this);
    if (details) throw new AppException(AppErrors.VALIDATION_FAILURE, details);
  }
}
