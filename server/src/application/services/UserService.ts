import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { UserUsecaseDto } from "@core/domain/user/usecase/dto/UserUsecaseDto";
import { UnitOfWork } from "@core/common/persistence/UnitOfWork";
import { UpdateUserPort } from "@core/domain/user/usecase/port/UpdateUserPort";
import { REQUEST } from "@nestjs/core";
import { HttpResponseWithOptionalUser } from "@application/api/http-rest/auth/type/HttpAuthTypes";
import { UserUsecase } from "@core/domain/user/usecase/UserUsecase";
import { CreateUserPort } from "@core/domain/user/usecase/port/CreateUserPort";
import { GetUserPort } from "@core/domain/user/usecase/port/GetUserPort";

@Injectable()
export class UserService implements UserUsecase {
  constructor(
    @Inject(REQUEST)
    private readonly requestWithOptionalUser: HttpResponseWithOptionalUser,
    private readonly unitOfWork: UnitOfWork,
  ) {}

  public async getUser(payload: GetUserPort): Promise<UserUsecaseDto> {
    const user = await this.unitOfWork
      .getUserRepository()
      .findUser({ id: payload.userId });

    if (!user) throw new NotFoundException("User not found");
    return UserUsecaseDto.newFromEntity(user);
  }

  public async createUser(payload: CreateUserPort): Promise<UserUsecaseDto> {
    throw new Error("Not implemented");
  }

  public async updateMe(payload: UpdateUserPort): Promise<UserUsecaseDto> {
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
      return UserUsecaseDto.newFromEntity(user);
    });
  }
}
