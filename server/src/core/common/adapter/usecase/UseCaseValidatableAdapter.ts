import Code from "@core/common/constants/Code";
import { Exception } from "@core/common/exception/Exception";
import { ClassValidator } from "@core/common/util/class-validator/ClassValidator";

export class UseCaseValidatableAdapter {
  public async validate(): Promise<void> {
    const details = await ClassValidator.validate(this);
    if (details)
      throw Exception.newFromCode(Code.USE_CASE_PORT_VALIDATION_ERROR, details);
  }
}
