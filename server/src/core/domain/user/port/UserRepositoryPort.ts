import { IBaseRepository } from "@core/common/persistence/IBaseRepository";
import { RepositoryFindOptions } from "@core/common/persistence/RepositoryOptions";
import { Optional } from "@core/common/type/CommonTypes";
import { User } from "../entity/User";

export interface UserRepositoryPort extends IBaseRepository<User> {
  findUser(
    by: { id?: string; email?: string },
    options?: RepositoryFindOptions,
  ): Promise<Optional<User>>;

  countUsers(
    by: { id?: string; email?: string },
    options?: RepositoryFindOptions,
  ): Promise<number>;

  addUser(user: User): Promise<{ id: string }>;

  updateUser(user: User): Promise<void>;

  deleteUser(userId: string): Promise<void>;
}
