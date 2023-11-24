import { User } from "../entity/User";
import { UserUsecaseDto } from "./dto/UserUsecaseDto";
import { CreateUserPort } from "./port/CreateUserPort";
import { UpdateUserPort } from "./port/UpdateUserPort";

export interface UserUsecase {
  createUser(payload: CreateUserPort): Promise<UserUsecaseDto>;

  getUserById(id: string): Promise<UserUsecaseDto>;
  findUserByEmail(email: string): Promise<UserUsecaseDto | null>;

  getUsers(): Promise<UserUsecaseDto[]>;
  updateUser(user: User): Promise<void>;
  updateProfile(
    updaterId: string,
    payload: UpdateUserPort,
  ): Promise<UserUsecaseDto>;

  deleteUserById(id: string): Promise<UserUsecaseDto>;
}
