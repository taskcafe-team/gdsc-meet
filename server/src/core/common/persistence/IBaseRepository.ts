export interface IBaseRepository<TEntity> {
  getById(id: string | number): Promise<TEntity | null>;
  getByEmail(email: string): Promise<TEntity | null>;
  getAll(): Promise<TEntity[]>;
  create(entity: TEntity): Promise<TEntity>;
  update(id: string | number, entity: TEntity): Promise<TEntity | null>;
  delete(id: string | number): Promise<TEntity | null>;
}
