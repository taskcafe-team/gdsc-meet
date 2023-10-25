import { Prisma } from "@prisma/client";

import { Participant } from "@core/domain/participant/entity/Participant";
import { RepositoryFindOptions } from "@core/common/persistence/RepositoryOptions";
import { Nullable, Optional } from "@core/common/type/CommonTypes";

import { PrismaBaseRepository } from "./PrismaBaseRepository";
import { PrismaParticipant } from "../entity/participant/PrismaParticipant";
import { PrismaParticipantMapper } from "../entity/participant/PrismaParticipantMapper";

export class PrismaParticipantRepositoryAdapter extends PrismaBaseRepository<Participant> {
  constructor(context: Prisma.TransactionClient) {
    super(Prisma.ModelName.Meeting, context);
  }

  public async findParticipant(
    by: { id?: string; userId?: string; meetingId: string },
    options: RepositoryFindOptions = {},
  ): Promise<Optional<Participant>> {
    const context = this.context.participant;
    const findOptions: Prisma.ParticipantFindFirstArgs = { where: {} };

    if (by.id) findOptions.where!.id = by.id;
    if (by.userId) findOptions.where!.userId = by.userId;
    if (by.userId) findOptions.where!.meetingId = by.meetingId;

    const orm: Nullable<PrismaParticipant> = (await context.findFirst(
      findOptions,
    )) as PrismaParticipant;

    let domain: Optional<Participant>;
    if (orm) domain = PrismaParticipantMapper.toDomainEntity(orm);

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
