import { Prisma } from "@prisma/client";

import { UserRepositoryPort } from "@core/domain/user/port/UserRepositoryPort";
import { RepositoryFindOptions } from "@core/common/persistence/RepositoryOptions";
import { User } from "@core/domain/user/entity/User";

import { PrismaBaseRepository } from "./PrismaBaseRepository";
import { PrismaUser } from "../entity/user/PrismaUser";
import { PrismaUserMapper } from "../entity/user/PrismaUserMapper";
import { Nullable, Optional } from "@core/common/type/CommonTypes";
import { Injectable } from "@nestjs/common";
import { PrismaService } from "../PrismaService";

@Injectable()
export class PrismaUserRepositoryAdapter
  extends PrismaBaseRepository<User>
  implements UserRepositoryPort
{
  constructor(context: PrismaService) {
    super(Prisma.ModelName.User, context);
  }

  public async deleteUser(id: string): Promise<void> {
    this.context.user.delete({ where: { id } });
  }

  public async findUser(
    by: { id?: string; email?: string },
    options?: RepositoryFindOptions,
  ): Promise<Optional<User>> {
    const findOptions: Prisma.UserFindFirstArgs = { where: {} };

    if (by.id) findOptions.where!.id = by.id;
    if (by.email) findOptions.where!.email = by.email;

    if (!options?.includeRemoved) findOptions.where!.removedAt = null;

    const user: Nullable<PrismaUser> = (await this.context.user.findFirst(
      findOptions,
    )) as PrismaUser;

    let domainEntity: Optional<User>;
    if (user) domainEntity = PrismaUserMapper.toDomainEntity(user);

    return domainEntity;
  }

  public async countUsers(
    by: { id?: string; email?: string },
    options: RepositoryFindOptions = {},
  ): Promise<number> {
    const findOptions: Prisma.UserCountArgs = { where: {} };

    if (by.id) findOptions.where!.id = by.id;
    if (by.email) findOptions.where!.email = by.email;

    if (!options.includeRemoved) findOptions.where!.removedAt = null;

    return this.context.user.count(findOptions);
  }

  public async addUser(user: User): Promise<{ id: string }> {
    const ormUser: PrismaUser = await this.context.user.create({
      data: PrismaUserMapper.toOrmEntity(user),
    });

    return { id: ormUser.id };
  }

  public async updateUser(user: User): Promise<void> {
    await this.context.user.update({
      where: { id: user.getId() },
      data: PrismaUserMapper.toOrmEntity(user),
    });
  }
}
