import { Inject, Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { User as PrismaUser } from "@prisma/client";

import { User } from "@core/domain/user/entity/User";
import { Exception } from "@core/common/exception/Exception";
import { Code } from "@core/common/code/Code";
import { Nullable } from "@core/common/type/CommonTypes";
import { UserUsecase } from "@core/domain/user/usecase/UserUsecase";
import { UserUsecaseDto } from "@core/domain/user/usecase/dto/UserUsecaseDto";

import { GetUserPort } from "../../domain/user/port/GetUserPort";
import { CreateUserPort } from "../../domain/user/port/CreateUserPort";

import { UnitOfWork } from "@core/common/persistence/UnitOfWork";

@Injectable()
export class UserService implements UserUsecase {
  constructor(private readonly unitOfWork: UnitOfWork) {}

  public async getUser(payload: GetUserPort): Promise<UserUsecaseDto> {
    throw new Error("Method not implemented.");
  }

  public async createUser(payload: CreateUserPort): Promise<UserUsecaseDto> {
    // return await this.prismaService.$transaction<UserUsecaseDto>(
    //   async (prisma) => {
    //     this.unitOfWork.setContext(prisma);
    //     const userExist = await this.unitOfWork.getUserRepository().findUser({
    //       email: payload.email,
    //     });
    //     CoreAssert.notEmpty(
    //       !userExist,
    //       Exception.new({
    //         code: Code.ENTITY_ALREADY_EXISTS_ERROR,
    //         overrideMessage: "User already exists.",
    //       }),
    //     );
    //     const user: User = await User.new({
    //       firstName: payload.firstName,
    //       lastName: payload.lastName,
    //       email: payload.email,
    //       role: payload.role,
    //       password: payload.password,
    //       avatar: payload.avatar,
    //       providerName: payload.providerName,
    //       providerId: payload.providerId,
    //     });
    //     await this.unitOfWork.getUserRepository().addUser(user);
    //     return UserUsecaseDto.newFromEntity(user);
    //   },
    //   {
    //     isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
    //   },
    // );

    throw new Error("Not implemented");
  }
}
