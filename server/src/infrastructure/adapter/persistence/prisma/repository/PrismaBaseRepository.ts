import { Prisma } from "@prisma/client";
import { IBaseRepository } from "@core/common/persistence/IBaseRepository";

export abstract class PrismaBaseRepository<TEntity>
  implements IBaseRepository<TEntity>
{
  protected context: Prisma.TransactionClient;
  protected readonly model: Prisma.ModelName;

  constructor(model: Prisma.ModelName, context: Prisma.TransactionClient) {
    this.context = context;
    this.model = model;
  }

  public setContext(context: Prisma.TransactionClient) {
    this.context = context;
  }

  public getContext() {
    return this.context;
  }

  public async getById(id: string): Promise<TEntity | null> {
    return this.context[this.model].findUnique({
      where: { id },
    });
  }

  public async getAll(): Promise<TEntity[]> {
    return this.context[this.model].findMany();
  }

  public async create(data: TEntity): Promise<TEntity> {
    return this.context[this.model].create({ data });
  }

  public async update(id: string, data: TEntity): Promise<TEntity | null> {
    return this.context[this.model].update({
      where: { id },
      data,
    });
  }

  public async delete(id: string): Promise<TEntity | null> {
    return this.context[this.model].delete({
      where: { id },
    });
  }
}
