import { AuthProviderName } from "@core/common/enums/AuthEnum";
import { UserRole } from "@core/common/enums/UserEnums";

export interface CreateUserPort {
  firstName: string | null;
  lastName: string | null;
  email: string;
  role: UserRole;
  password: string | null;
  avatar: string | null;
  authProviderName: AuthProviderName | null;
  providerId: string | null;
}
