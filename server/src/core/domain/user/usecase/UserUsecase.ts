import { UserUsecaseDTO } from "@core/domain/user/usecase/dto/UserUsecaseDto";
import { GetUserPort } from "@core/domain/user/port/GetUserPort";
import { CreateUserPort } from "@core/domain/user/port/CreateUserPort";

export interface UserUsecase {
  getUser(payload: GetUserPort): Promise<UserUsecaseDTO>;
  createUser(payload: CreateUserPort): Promise<UserUsecaseDTO>;
}
