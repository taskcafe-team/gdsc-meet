import { UserUsecaseDto } from "@core/domain/user/usecase/dto/UserUsecaseDto";
import { GetUserPort } from "@core/domain/user/port/GetUserPort";
import { CreateUserPort } from "@core/domain/user/port/CreateUserPort";
import { GetUserWithEmailPort } from "../port/GetUserWithEmailPort";

export interface UserUsecase {
  getUser(payload: GetUserPort): Promise<UserUsecaseDto>;
  getUserByEmail(payload: GetUserWithEmailPort): Promise<UserUsecaseDto>;
  createUser(payload: CreateUserPort): Promise<UserUsecaseDto>;
}
