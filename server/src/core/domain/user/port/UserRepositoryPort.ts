import { User } from "../entity/User";
import { Nullable } from "@core/common/type/CommonTypes";

export interface UserRepositoryPort {
  findUser(by: { id?: string; email?: string }): Promise<Nullable<User>>;
  countUsers(by: { id?: string; email?: string }): Promise<number>;
  addUser(user: User): Promise<User>;
  updateUser(user: User): Promise<void>;
  deleteUser(userId: string): Promise<Nullable<{ id: string }>>;
}
