import { Prisma } from "@prisma/client";

import { Participant } from "@core/domain/participant/entity/Participant";
import { RepositoryFindOptions } from "@core/common/persistence/RepositoryOptions";
import { Nullable } from "@core/common/type/CommonTypes";

import { PrismaBaseRepository } from "./PrismaBaseRepository";
import { PrismaParticipant } from "../entity/participant/PrismaParticipant";
import { PrismaParticipantMapper } from "../entity/participant/PrismaParticipantMapper";
import {
  FindFirstParticipantBy,
  ParticipantRepositoryPort,
} from "@core/domain/participant/usecase/port/ParticipantRepositoryPort";
import { ParticipantRole } from "@core/common/enums/ParticipantEnums";

export class PrismaParticipantRepositoryAdapter
  extends PrismaBaseRepository
  implements ParticipantRepositoryPort
{
  constructor(context: Prisma.TransactionClient) {
    super(context);
  }

  public async findManyParticipants(by: {
    id?: string;
    meetingId?: string;
    meetingIds?: string[];
    userId?: string;
    role?: ParticipantRole;
  }): Promise<Participant[]> {
    const context = this.context.participant;
    const findOptions: Prisma.ParticipantFindManyArgs = {
      where: {},
      include: { meeting: true, user: true },
    };

    if (by.id) findOptions.where!.id = by.id;
    if (by.meetingId) findOptions.where!.meetingId = by.meetingId;
    if (by.meetingIds) findOptions.where!.meetingId = { in: by.meetingIds };
    if (by.role) findOptions.where!.role = by.role;
    if (by.userId) findOptions.where!.userId = by.userId;

    const orm: PrismaParticipant[] = (await context.findMany(
      findOptions,
    )) as PrismaParticipant[];

    let domain: Participant[] = [];
    if (orm) domain = PrismaParticipantMapper.toDomainEntities(orm);

    return domain;
  }

  public async findParticipant(
    by: FindFirstParticipantBy,
    options?: RepositoryFindOptions,
  ): Promise<Nullable<Participant>> {
    const context = this.context.participant;
    const findOptions: Prisma.ParticipantFindFirstArgs = {
      where: {},
      include: { meeting: true, user: true },
    };

    if ("id" in by) findOptions.where!.id = by.id;
    if ("userId" in by && "meetingId" in by) {
      findOptions.where!.userId = by.userId;
      findOptions.where!.meetingId = by.meetingId;
    }
    if ("role" in by) {
      findOptions.where!.role = by.role;
      findOptions.where!.meetingId = by.meetingId;
    }
    const orm = await context.findFirst(findOptions).then((p) => p ?? null);

    const domain =
      orm && PrismaParticipantMapper.toDomainEntity(orm as PrismaParticipant);
    return domain;
  }

  public async addParticipant(domain: Participant): Promise<Participant> {
    const ormEntity = PrismaParticipantMapper.toOrmEntity(domain);
    const { user, meeting, ...dataWithout } = ormEntity;

    const orm: PrismaParticipant = (await this.context.participant.create({
      data: dataWithout,
    })) as PrismaParticipant;

    return PrismaParticipantMapper.toDomainEntity(orm);
  }
}
