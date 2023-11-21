import {
  ClassValidator,
  ClassValidationDetails,
} from "@core/common/util/class-validator/ClassValidator";
import { Nullable } from "../type/CommonTypes";
import { AppException } from "../exception/AppException";
import { AppErrors } from "../exception/AppErrors";

export class Entity<TIdentifier extends string | number> {
  protected id: Nullable<TIdentifier>;

  public getId(): TIdentifier {
    if (!this.id) throw new AppException(AppErrors.ENTITY_NOT_FOUND_ERROR);

    return this.id;
  }

  public async validate(): Promise<void> {
    const details: Nullable<ClassValidationDetails> =
      await ClassValidator.validate(this);

    if (details) {
      throw new AppException(AppErrors.ENTITY_NOT_FOUND_ERROR, details);
    }
  }
}
