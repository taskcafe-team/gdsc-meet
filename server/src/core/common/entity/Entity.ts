import Code from "@core/common/constants/Code";
import { Exception } from "@core/common/exception/Exception";
import {
  ClassValidator,
  ClassValidationDetails,
} from "@core/common/util/class-validator/ClassValidator";
import { Nullable } from "../type/CommonTypes";

export class Entity<TIdentifier extends string | number> {
  protected id: Nullable<TIdentifier>;

  public getId(): TIdentifier {
    if (!this.id)
      throw new Exception(
        Code.ENTITY_VALIDATION_ERROR,
        `${this.constructor.name}: ID is empty`,
      );

    return this.id;
  }

  public async validate(): Promise<void> {
    const details: Nullable<ClassValidationDetails> =
      await ClassValidator.validate(this);

    if (details) {
      throw new Exception(
        Code.ENTITY_VALIDATION_ERROR.code.toString(),
        null,
        null,
        details,
      );
    }
  }
}
