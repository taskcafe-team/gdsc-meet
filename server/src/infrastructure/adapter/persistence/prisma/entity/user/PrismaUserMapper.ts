import { User } from "@core/domain/user/entity/User";
import { PrismaUser } from "./PrismaUser";
import { instanceToPlain } from "class-transformer";
import { CreateUserEntityPayload } from "@core/domain/user/entity/type/CreateUserEntityPayload";
import { UserRole } from "@core/common/enums/UserEnums";
import { AuthProviderName } from "@core/common/enums/AuthEnum";

export class PrismaUserMapper {
  public static toOrmEntity(domain: User): PrismaUser {
    const orm = new PrismaUser();

    orm.id = domain.id;
    orm.firstName = domain.firstName;
    orm.lastName = domain.lastName;
    orm.email = domain.email;
    orm.password = domain.password;
    orm.isValid = domain.isValid;
    orm.role = domain.role;
    orm.avatar = domain.avatar;
    orm.authProviderName = domain.authProviderName;
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
    const domain = new User({
      id: orm.id,
      firstName: orm.firstName,
      lastName: orm.lastName,
      email: orm.email,
      password: orm.password,
      isValid: orm.isValid,
      role: orm.role as UserRole,
      avatar: orm.avatar,
      authProviderName: orm.authProviderName as AuthProviderName,
      providerId: orm.providerId,
      createdAt: orm.createdAt,
      updatedAt: orm.updatedAt ?? undefined,
      removedAt: orm.removedAt ?? undefined,
    });
    return domain;
  }

  public static toDomainEntities(ormUsers: PrismaUser[]): User[] {
    return ormUsers.map((ormUser) => this.toDomainEntity(ormUser));
  }
}
