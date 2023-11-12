import { AuthProviderName } from "@core/common/enums/AuthEnum";
import { UserRole } from "@core/common/enums/UserEnums";
import { Nullable } from "@core/common/type/CommonTypes";

export type CreateUserEntityPayload = {
  firstName?: Nullable<string>;
  lastName?: Nullable<string>;
  email?: Nullable<string>;
  isValid?: Nullable<boolean>;
  role: UserRole;
  password?: Nullable<string>;
  avatar?: Nullable<string>;
  authProviderName?: Nullable<AuthProviderName>;
  providerId?: Nullable<string>;

  id?: Nullable<string>;
  createdAt?: Nullable<Date>;
  updatedAt?: Nullable<Date>;
  removedAt?: Nullable<Date>;
};
