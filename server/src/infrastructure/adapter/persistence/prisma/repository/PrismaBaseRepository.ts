import { Prisma, PrismaClient } from "@prisma/client";
import { IBaseRepository } from "@core/common/persistence/IBaseRepository";

export abstract class PrismaBaseRepository<TEntity>
  implements IBaseRepository<TEntity>
{
  protected context: PrismaClient;
  protected model: Prisma.ModelName;

  constructor(
    model: Prisma.ModelName,
    context: PrismaClient = new PrismaClient(),
  ) {
    this.context = context;
    this.model = model;
  }

  public setContext(context: PrismaClient) {
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
