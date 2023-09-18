import { UserRole } from "@core/common/enums/UserEnums";

export interface UpdateUserPort {
  firstName: string | null;
  lastName: string | null;
  role: UserRole;
  avatar: string | null;
}
