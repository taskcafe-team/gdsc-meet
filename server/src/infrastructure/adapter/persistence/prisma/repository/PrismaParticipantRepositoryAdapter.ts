import { Prisma } from "@prisma/client";

import { Participant } from "@core/domain/participant/entity/Participant";
import { Nullable } from "@core/common/type/CommonTypes";

import { PrismaBaseRepository } from "./PrismaBaseRepository";
import { PrismaParticipant } from "../entity/participant/PrismaParticipant";
import { PrismaParticipantMapper } from "../entity/participant/PrismaParticipantMapper";
import { ParticipantRepositoryPort } from "@core/domain/participant/usecase/port/ParticipantRepositoryPort";
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

  public async findParticipant(by: {
    id?: string;
    meetingId?: string;
    meetingIds?: string[];
    userId?: string;
    role?: ParticipantRole;
  }): Promise<Nullable<Participant>> {
    const context = this.context.participant;

    const findOptions: Prisma.ParticipantFindFirstArgs = {
      where: {
        id: by.id,
        meetingId: by.meetingIds ? { in: by.meetingIds } : by.meetingId,
        userId: by.userId,
        role: by.role,
      },
      include: { meeting: true, user: true },
    };

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
