import { ProviderNameEnums } from "@core/common/enums/ProviderNameEnums";
import { UserRole } from "@core/common/enums/UserEnums";

export interface CreateUserPort {
  firstName: string | null;
  lastName: string | null;
  email: string;
  role: UserRole;
  password: string | null;
  avatar: string | null;
  providerName: ProviderNameEnums | null;
  providerId: string | null;
}
