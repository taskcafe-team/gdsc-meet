import { Prisma } from "@prisma/client";

import { UserRepositoryPort } from "@core/domain/user/usecase/port/UserRepositoryPort";
import { RepositoryFindOptions } from "@core/common/persistence/RepositoryOptions";
import { User } from "@core/domain/user/entity/User";

import { PrismaBaseRepository } from "./PrismaBaseRepository";
import { PrismaUser } from "../entity/user/PrismaUser";
import { PrismaUserMapper } from "../entity/user/PrismaUserMapper";
import { Nullable } from "@core/common/type/CommonTypes";

export class PrismaUserRepositoryAdapter
  extends PrismaBaseRepository
  implements UserRepositoryPort
{
  constructor(context: Prisma.TransactionClient) {
    super(context);
  }

  public async deleteUser(id: string) {
    return await this.context.user
      .delete({ where: { id } })
      .then(() => ({ id }));
  }

  public async findUser(by: {
    id?: string;
    email?: string;
  }): Promise<Nullable<User>> {
    const findOptions: Prisma.UserFindFirstArgs = { where: by };

    const user: Nullable<PrismaUser> = await this.context.user
      .findFirst(findOptions)
      .then((user) => user ?? null);

    return user && PrismaUserMapper.toDomainEntity(user);
  }

  public async countUsers(by: {
    id?: string;
    email?: string;
  }): Promise<number> {
    const findOptions: Prisma.UserCountArgs = { where: by };
    return this.context.user.count(findOptions);
  }

  public async addUser(user: User) {
    const data = PrismaUserMapper.toOrmEntity(user);
    const ormUser: PrismaUser = await this.context.user.create({ data });
    return PrismaUserMapper.toDomainEntity(ormUser);
  }

  public async updateUser(user: User): Promise<void> {
    await this.context.user.update({
      where: { id: user.id },
      data: PrismaUserMapper.toOrmEntity(user),
    });
  }
}
