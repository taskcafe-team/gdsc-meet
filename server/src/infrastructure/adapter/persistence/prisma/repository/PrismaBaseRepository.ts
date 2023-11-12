import { Prisma } from "@prisma/client";

export abstract class PrismaBaseRepository {
  protected context: Prisma.TransactionClient;

  constructor(context: Prisma.TransactionClient) {
    this.context = context;
  }

  public set _context(context: Prisma.TransactionClient) {
    this.context = context;
  }

  public get _context() {
    return this.context;
  }
}
