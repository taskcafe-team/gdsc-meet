import { Nullable } from "@core/common/type/CommonTypes";

export type EditUserEntityPayload = {
  firstName?: Nullable<string>;
  lastName?: Nullable<string>;
  avatar?: Nullable<string>;
  isValid?: boolean;
};
