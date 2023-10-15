import { User } from "./../../domain/user/entity/User";
import { Prisma } from "@prisma/client";

import { Injectable } from "@nestjs/common";
import { UserUsecase } from "@core/domain/user/usecase/UserUsecase";
import { UserUsecaseDto } from "@core/domain/user/usecase/dto/UserUsecaseDto";

import { GetUserPort } from "../../domain/user/port/GetUserPort";
import { CreateUserPort } from "../../domain/user/port/CreateUserPort";
import { DeleteUserPort } from "@core/domain/user/port/DeleteUserPort";

import { UnitOfWork } from "@core/common/persistence/UnitOfWork";
import { Exception } from "@core/common/exception/Exception";
import { Code } from "@core/common/code/Code";
import { PrismaService } from "@infrastructure/adapter/persistence/prisma/PrismaService";
import { UserQueryParametersDto } from "@core/dto/UserQueryParametersDto";

@Injectable()
export class UserService implements UserUsecase {
  constructor(
    private readonly unitOfWork: UnitOfWork,
    private readonly prismaService: PrismaService,
  ) {}

  public async getUser(payload: GetUserPort): Promise<UserUsecaseDto> {
    const user = await this.unitOfWork
      .getUserRepository()
      .findUser({ id: payload.userId });

    if (!user) throw Exception.new({ code: Code.NOT_FOUND_ERROR });
    return UserUsecaseDto.newFromEntity(user);
  }

  public async buildUsersQuery({
    id,
    email,
    isValid,
    offset,
    limit,
  }: UserQueryParametersDto): Promise<{
    total: number;
    users: User[];
  }> {
    const query: Prisma.UserFindManyArgs = {
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        isValid: true,
        avatar: true,
      },
      where: {},
    };

    if (id) {
      if (query.where) {
        query.where.id = id;
      }
    }

    if (email) {
      if (query.where) {
        query.where.email = {
          contains: email,
          mode: "insensitive",
        };
      }
    }

    if (isValid !== undefined) {
      if (query.where) {
        query.where.isValid = isValid;
      }
    }

    if (offset !== undefined) {
      query.skip = offset;
    }

    if (limit !== undefined) {
      query.take = limit;
    }

    const [total, users] = await this.prismaService.$transaction([
      this.prismaService.user.count({
        where: query.where,
      }),
      this.prismaService.user.findMany(query),
    ]);

    return { total, users } as any;
  }

  public async createUser(payload: CreateUserPort): Promise<UserUsecaseDto> {
    throw new Error("Not implemented");
  }

  // public async getUserByEmail(
  //   payload: GetUserWithEmailPort,
  //   offset?: number,
  //   limit?: number,
  // ): Promise<UserUsecaseDto> {
  //   const user = await this.unitOfWork
  //     .getUserRepository()
  //     .findUserByEmail({ email: payload.userEmail }, { limit, offset });
  //   if (!user) throw Exception.new({ code: Code.NOT_FOUND_ERROR });
  //   return UserUsecaseDto.newFromEntity(user);
  // }

  public async deleteUser(payload: DeleteUserPort): Promise<void> {
    const user = await this.unitOfWork
      .getUserRepository()
      .findUser({ id: payload.userId });
    if (!user) throw Exception.new({ code: Code.NOT_FOUND_ERROR });
    return await this.unitOfWork.getUserRepository().deleteUser(payload.userId);
  }
}
