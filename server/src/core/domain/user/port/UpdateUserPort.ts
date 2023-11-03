import { UserRole } from "@core/common/enums/UserEnums";

export interface UpdateUserPort {
  firstName?: string;
  lastName?: string;
  role?: UserRole;
  avatar?: string;
}
