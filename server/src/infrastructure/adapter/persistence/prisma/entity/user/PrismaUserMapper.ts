import { User } from "@core/domain/user/entity/User";
import { PrismaUser } from "./PrismaUser";
import { UserRole } from "@core/common/enums/UserEnums";
import { ProviderNameEnums as PrismaProviderNameEnums } from "@prisma/client";
import { ProviderNameEnums } from "@core/common/enums/ProviderNameEnums";

export class PrismaUserMapper {
  public static toOrmEntity(domain: User): PrismaUser {
    const orm: PrismaUser = new PrismaUser();

    orm.id = domain.getId();
    orm.firstName = domain.firstName;
    orm.lastName = domain.lastName;
    orm.email = domain.email;
    orm.isValid = domain.isValid;
    orm.role = domain.role;
    orm.password = domain.password;
    orm.avatar = domain.avatar;
    orm.providerName = domain.providerName as PrismaProviderNameEnums;
    orm.providerId = domain.providerId;

    orm.createdAt = domain.createdAt;
    orm.updatedAt = domain.updatedAt;
    orm.removedAt = domain.removedAt;

    return orm;
  }

  public static toOrmEntities(domainUsers: User[]): PrismaUser[] {
    return domainUsers.map((domainUser) => this.toOrmEntity(domainUser));
  }

  public static toDomainEntity(orm: PrismaUser): User {
    const domainUser: User = new User({
      firstName: orm.firstName,
      lastName: orm.lastName,
      email: orm.email,
      isValid: orm.isValid,
      role: orm.role as UserRole,
      password: orm.password,
      avatar: orm.avatar,
      providerName: orm.providerName as ProviderNameEnums,
      providerId: orm.providerId,
      id: orm.id,
      createdAt: orm.createdAt,
      updatedAt: orm.updatedAt,
      removedAt: orm.removedAt,
    });

    return domainUser;
  }

  public static toDomainEntities(ormUsers: PrismaUser[]): User[] {
    return ormUsers.map((ormUser) => this.toDomainEntity(ormUser));
  }
}
