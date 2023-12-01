import { User } from "../entity/User";
import { UserUsecaseDTO } from "./dto/UserUsecaseDTO";
import { CreateUserPort } from "./port/CreateUserPort";
import { UpdateUserPort } from "./port/UpdateUserPort";

export abstract class UserUsecase {
  abstract createUser(payload: CreateUserPort): Promise<UserUsecaseDTO>;
  abstract getUserById(id: string): Promise<UserUsecaseDTO>;
  abstract findUserByEmail(email: string): Promise<UserUsecaseDTO | null>;
  abstract getUsers(): Promise<UserUsecaseDTO[]>;
  abstract updateUser(user: User): Promise<void>;
  abstract updateProfile(
    updaterId: string,
    payload: UpdateUserPort,
  ): Promise<UserUsecaseDTO>;
  abstract deleteUserById(id: string): Promise<UserUsecaseDTO>;
}
