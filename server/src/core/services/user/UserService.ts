import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { UserUsecase } from "@core/domain/user/usecase/UserUsecase";
import { UserUsecaseDTO } from "@core/domain/user/usecase/dto/UserUsecaseDto";

import { GetUserPort } from "../../domain/user/port/GetUserPort";
import { CreateUserPort } from "../../domain/user/port/CreateUserPort";

import { UnitOfWork } from "@core/common/persistence/UnitOfWork";
import { UpdateUserPort } from "@core/domain/user/port/UpdateUserPort";
import { REQUEST } from "@nestjs/core";
import { HttpResponseWithOptionalUser } from "@application/api/http-rest/auth/type/HttpAuthTypes";

@Injectable()
export class UserService implements UserUsecase {
  constructor(
    @Inject(REQUEST)
    private readonly requestWithOptionalUser: HttpResponseWithOptionalUser,
    private readonly unitOfWork: UnitOfWork,
  ) {}

  public async getUser(payload: GetUserPort): Promise<UserUsecaseDTO> {
    const user = await this.unitOfWork
      .getUserRepository()
      .findUser({ id: payload.userId });

    if (!user) throw new NotFoundException("User not found");
    return UserUsecaseDTO.newFromEntity(user);
  }

  public async createUser(payload: CreateUserPort): Promise<UserUsecaseDTO> {
    throw new Error("Not implemented");
  }

  public async updateMe(payload: UpdateUserPort): Promise<UserUsecaseDTO> {
    return await this.unitOfWork.runInTransaction(async () => {
      const userId = this.requestWithOptionalUser.user?.id || "";
      const user = await this.unitOfWork
        .getUserRepository()
        .findUser({ id: userId });
      if (!user) throw new NotFoundException("User not found");
      await user.edit({
        firstName: payload.firstName,
        lastName: payload.lastName,
        avatar: payload.avatar,
      });

      await this.unitOfWork.getUserRepository().updateUser(user);
      return UserUsecaseDTO.newFromEntity(user);
    });
  }
}
