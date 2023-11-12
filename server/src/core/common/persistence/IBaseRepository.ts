import { Nullable } from "../type/CommonTypes";

export interface IBaseRepository<TEntity> {
  getById(id: string): Promise<Nullable<TEntity>>;
  getAll(): Promise<TEntity[]>;
  create(entity: TEntity): Promise<TEntity>;
  update(id: string, entity: TEntity): Promise<Nullable<TEntity>>;
  delete(id: string): Promise<Nullable<TEntity>>;
}
