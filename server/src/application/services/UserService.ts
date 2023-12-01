import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { UserUsecaseDTO } from "@core/domain/user/usecase/dto/UserUsecaseDTO";
import { UnitOfWork } from "@core/common/persistence/UnitOfWork";
import { UpdateUserPort } from "@core/domain/user/usecase/port/UpdateUserPort";
import { REQUEST } from "@nestjs/core";
import { UserUsecase } from "@core/domain/user/usecase/UserUsecase";
import { CreateUserPort } from "@core/domain/user/usecase/port/CreateUserPort";
import { User } from "@core/domain/user/entity/User";

@Injectable()
export class UserService implements UserUsecase {
  constructor(private readonly unitOfWork: UnitOfWork) {}

  async createUser(payload: CreateUserPort): Promise<UserUsecaseDTO> {
    const user = await User.new(payload);
    return await this.unitOfWork.getUserRepository().addUser(user);
  }

  async getUserById(id: string): Promise<UserUsecaseDTO> {
    const user = await this.unitOfWork.getUserRepository().findUser({ id });
    if (!user) throw new NotFoundException("User not found");
    return UserUsecaseDTO.newFromEntity(user);
  }

  async findUserByEmail(email: string): Promise<UserUsecaseDTO | null> {
    const user = await this.unitOfWork.getUserRepository().findUser({ email });
    return user ? UserUsecaseDTO.newFromEntity(user) : null;
  }

  async getUsers(): Promise<UserUsecaseDTO[]> {
    throw new Error("Method not implemented.");
  }

  async updateUser(user: User): Promise<void> {
    await this.unitOfWork.getUserRepository().updateUser(user);
  }

  async deleteUserById(id: string): Promise<UserUsecaseDTO> {
    const user = await this.unitOfWork.getUserRepository().findUser({ id });
    if (!user) throw new NotFoundException("User not found");
    await this.unitOfWork.getUserRepository().deleteUser(id);
    return UserUsecaseDTO.newFromEntity(user);
  }

  async updateProfile(
    updaterId: string,
    payload: UpdateUserPort,
  ): Promise<UserUsecaseDTO> {
    const user = await this.unitOfWork
      .getUserRepository()
      .findUser({ id: updaterId });
    if (!user) throw new NotFoundException("User not found");

    await user.edit({
      firstName: payload.firstName,
      lastName: payload.lastName,
      avatar: payload.avatar,
    });

    await this.updateUser(user);
    return UserUsecaseDTO.newFromEntity(user);
  }

  // public async createUser(payload: CreateUserPort): Promise<User> {
  //   const user = await User.new(payload);
  //   return await this.unitOfWork.getUserRepository().addUser(user);
  // }

  // public async getUserById(id: string): Promise<UserUsecaseDTO> {
  //   const user = await this.unitOfWork.getUserRepository().findUser({ id });
  //   if (!user) throw new NotFoundException("User not found");
  //   return UserUsecaseDTO.newFromEntity(user);
  // }

  // public async findUserByEmail(email: string): Promise<UserUsecaseDTO | null> {
  //   const user = await this.unitOfWork.getUserRepository().findUser({ email });
  //   if (!user) return null;
  //   return UserUsecaseDTO.newFromEntity(user);
  // }

  // public async getUsers(): Promise<UserUsecaseDTO[]> {
  //   throw new Error("Method not implemented.");
  // }

  // public async getUser(payload: GetUserPort): Promise<UserUsecaseDTO> {
  //   const user = await this.unitOfWork
  //     .getUserRepository()
  //     .findUser({ id: payload.userId });

  //   if (!user) throw new NotFoundException("User not found");
  //   return UserUsecaseDTO.newFromEntity(user);
  // }

  // public async updateUser(user: User): Promise<void> {
  //   await this.unitOfWork.getUserRepository().updateUser(user);
  // }

  // public async updateProfile(
  //   payload: UpdateUserPort,
  // ): Promise<UserUsecaseDTO> {

  // }

  // public async updateMe(payload: UpdateUserPort): Promise<UserUsecaseDTO> {
  //   return await this.unitOfWork.runInTransaction(async () => {
  //     const userId = this.requestWithOptionalUser.user?.id || "";
  //     const user = await this.unitOfWork
  //       .getUserRepository()
  //       .findUser({ id: userId });
  //     if (!user) throw new NotFoundException("User not found");
  //     await user.edit({
  //       firstName: payload.firstName,
  //       lastName: payload.lastName,
  //       avatar: payload.avatar,
  //     });

  //     await this.unitOfWork.getUserRepository().updateUser(user);
  //     return UserUsecaseDTO.newFromEntity(user);
  //   });
  // }
}
