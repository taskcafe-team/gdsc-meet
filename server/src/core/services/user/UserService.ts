import { Injectable } from "@nestjs/common";
import { UserUsecase } from "@core/domain/user/usecase/UserUsecase";
import { UserUsecaseDto } from "@core/domain/user/usecase/dto/UserUsecaseDto";

import { GetUserPort } from "../../domain/user/port/GetUserPort";
import { CreateUserPort } from "../../domain/user/port/CreateUserPort";
import { DeleteUserPort } from "@core/domain/user/port/DeleteUserPort";
import { GetUserWithEmailPort } from "@core/domain/user/port/GetUserWithEmailPort";

import { UnitOfWork } from "@core/common/persistence/UnitOfWork";
import { Exception } from "@core/common/exception/Exception";
import { Code } from "@core/common/code/Code";

@Injectable()
export class UserService implements UserUsecase {
  constructor(private readonly unitOfWork: UnitOfWork) {}

  public async getUser(payload: GetUserPort): Promise<UserUsecaseDto> {
    const user = await this.unitOfWork
      .getUserRepository()
      .findUser({ id: payload.userId });

    if (!user) throw Exception.new({ code: Code.NOT_FOUND_ERROR });
    return UserUsecaseDto.newFromEntity(user);
  }

  public async createUser(payload: CreateUserPort): Promise<UserUsecaseDto> {
    throw new Error("Not implemented");
  }

  public async getUserByEmail(
    payload: GetUserWithEmailPort,
  ): Promise<UserUsecaseDto> {
    const user = await this.unitOfWork
      .getUserRepository()
      .findUserByEmail({ email: payload.userEmail });

    if (!user) throw Exception.new({ code: Code.NOT_FOUND_ERROR });
    return UserUsecaseDto.newFromEntity(user);
  }

  public async deleteUser(payload: DeleteUserPort): Promise<void> {
    const user = await this.unitOfWork
      .getUserRepository()
      .findUser({ id: payload.userId });
    if (!user) throw Exception.new({ code: Code.NOT_FOUND_ERROR });
    return await this.unitOfWork.getUserRepository().deleteUser(payload.userId);
  }
}
