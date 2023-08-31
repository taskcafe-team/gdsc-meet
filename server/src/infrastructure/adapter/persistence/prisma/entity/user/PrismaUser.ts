import { ProviderNameEnums, User, UserRole } from "@prisma/client";

export class PrismaUser implements User {
  id: string;
  firstName: string | null;
  lastName: string | null;
  role: UserRole;
  email: string | null;
  isValid: boolean;
  password: string | null;
  avatar: string | null;
  providerName: ProviderNameEnums | null;
  providerId: string | null;

  createdAt: Date;
  updatedAt: Date | null;
  removedAt: Date | null;
}
