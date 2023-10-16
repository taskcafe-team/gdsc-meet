import { Injectable } from "@nestjs/common";
import { Prisma, PrismaClient } from "@prisma/client";

import { UnitOfWork } from "@core/common/persistence/UnitOfWork";

import { PrismaUserRepositoryAdapter } from "../repository/PrismaUserRepositoryAdapter";
import { MeetingRepositoryPort } from "@core/domain/meeting/port/MeetingRepositoryPort";
import { PrismaMeetingRepositoryAdapter } from "../repository/PrismaMeetingRepositoryAdapter";
import { ParticipantRepositoryPort } from "@core/domain/participant/usecase/port/ParticipantRepositoryPort";
import { PrismaParticipantRepositoryAdapter } from "../repository/PrismaParticipantRepositoryAdapter";
import { UserRepositoryPort } from "@core/domain/user/port/UserRepositoryPort";
import { PrismaBaseRepository } from "../repository/PrismaBaseRepository";
import { PrismaService } from "../PrismaService";

type TransactionOptions = Parameters<PrismaClient["$transaction"]>[1];

@Injectable()
export class PrismaUnitOfWork implements UnitOfWork {
  private context: Prisma.TransactionClient;
  private repositories: Record<string, any>;

  constructor(private readonly prisma: PrismaService) {
    this.context = prisma;
    this.repositories = {};
  }

  public async runInTransaction<T>(
    fn: () => Promise<T>,
    options?: TransactionOptions,
  ): Promise<T> {
    return await this.prisma.$transaction(async (ct) => {
      this.context = ct;
      const result = await fn();
      this.context = this.prisma;
      return result;
    }, options);
  }

  private getRepo<T extends PrismaBaseRepository<any>>(
    type: Prisma.ModelName,
    newRepo: () => T,
  ): T {
    if (this.repositories[type] == null) this.repositories[type] = newRepo();
    else if (this.repositories[type].getContext() !== this.context)
      this.repositories[type].setContext(this.context);

    return this.repositories[type];
  }

  public getUserRepository(): UserRepositoryPort {
    const type = Prisma.ModelName.User;
    this.getRepo(type, () => new PrismaUserRepositoryAdapter(this.context));
    return this.repositories[type];
  }

  public getMeetingRepository(): MeetingRepositoryPort {
    const type = Prisma.ModelName.Meeting;
    this.getRepo(type, () => new PrismaMeetingRepositoryAdapter(this.context));
    return this.repositories[type];
  }

  public getParticipantRepository(): ParticipantRepositoryPort {
    const type = Prisma.ModelName.Participant;
    this.getRepo(
      type,
      () => new PrismaParticipantRepositoryAdapter(this.context),
    );
    return this.repositories[type];
  }
}
