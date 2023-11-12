import { Prisma } from "@prisma/client";

export abstract class PrismaBaseRepository {
  protected context: Prisma.TransactionClient;

  constructor(context: Prisma.TransactionClient) {
    this.context = context;
  }
}
