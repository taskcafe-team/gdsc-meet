import { User } from "../entity/User";
import { UserUsecaseDto } from "./dto/UserUsecaseDto";
import { CreateUserPort } from "./port/CreateUserPort";
import { UpdateUserPort } from "./port/UpdateUserPort";

export abstract class UserUsecase {
  abstract createUser(payload: CreateUserPort): Promise<UserUsecaseDto>;
  abstract getUserById(id: string): Promise<UserUsecaseDto>;
  abstract findUserByEmail(email: string): Promise<UserUsecaseDto | null>;
  abstract getUsers(): Promise<UserUsecaseDto[]>;
  abstract updateUser(user: User): Promise<void>;
  abstract updateProfile(
    updaterId: string,
    payload: UpdateUserPort,
  ): Promise<UserUsecaseDto>;
  abstract deleteUserById(id: string): Promise<UserUsecaseDto>;
}
