import { UserUsecaseDto } from "./dto/UserUsecaseDto";
import { CreateUserPort } from "./port/CreateUserPort";
import { GetUserPort } from "./port/GetUserPort";
import { UpdateUserPort } from "./port/UpdateUserPort";

export interface UserUsecase {
  getUser(port: GetUserPort): Promise<UserUsecaseDto>;
  createUser(port: CreateUserPort): Promise<UserUsecaseDto>;
  updateMe(port: UpdateUserPort): Promise<UserUsecaseDto>;
}
