import { PrismaBaseRepository } from "./PrismaBaseRepository";
import { Meeting } from "@core/domain/meeting/entity/Meeting";
import { Prisma } from "@prisma/client";
import { PrismaMeetingMapper } from "../entity/meeting/PrismaMeetingMapper";
import { PrismaMeeting } from "../entity/meeting/PrismaMeeting";
import { Nullable, Optional } from "@core/common/type/CommonTypes";
import { RepositoryFindOptions } from "@core/common/persistence/RepositoryOptions";
import { MeetingRepositoryPort } from "@core/domain/meeting/port/MeetingRepositoryPort";
import { MeetingStatusEnums } from "@core/common/enums/MeetingEnums";

export class PrismaMeetingRepositoryAdapter
  extends PrismaBaseRepository<Meeting>
  implements MeetingRepositoryPort
{
  constructor(context: Prisma.TransactionClient) {
    super(Prisma.ModelName.Meeting, context);
  }

  public async findMeetings(by: {
    id?: string;
    ids?: string[];
    status?: MeetingStatusEnums;
  }): Promise<Meeting[]> {
    const findOptions: Prisma.MeetingFindManyArgs = { where: {} };

    if (by.id) findOptions.where!.id = by.id;
    if (by.ids) findOptions.where!.id = { in: by.ids };
    if (by.status) findOptions.where!.status = by.status;

    const orm: PrismaMeeting[] = await this.context.meeting.findMany(
      findOptions,
    );

    const domainEntities: Meeting[] = orm.map((o) =>
      PrismaMeetingMapper.toDomainEntity(o),
    );

    return domainEntities;
  }

  public async findMeeting(
    by: { id: string },
    options: RepositoryFindOptions = {},
  ): Promise<Optional<Meeting>> {
    const findOptions: Prisma.MeetingFindFirstArgs = { where: {} };

    if (by.id) findOptions.where!.id = by.id;

    if (!options?.includeRemoved) findOptions.where!.removedAt = null;

    const orm: Nullable<PrismaMeeting> = (await this.context.meeting.findFirst(
      findOptions,
    )) as PrismaMeeting;

    let domainEntity: Optional<Meeting>;
    if (orm) domainEntity = PrismaMeetingMapper.toDomainEntity(orm);

    return domainEntity;
  }

  public async addMeeting(meeting: Meeting): Promise<Meeting> {
    const orm: PrismaMeeting = await this.context.meeting.create({
      data: PrismaMeetingMapper.toOrmEntity(meeting),
    });

    return PrismaMeetingMapper.toDomainEntity(orm);
  }

  public async updateMeeting(
    by: { id: string },
    data: {
      startTime?: Date;
      endTime?: Date;
      title?: string;
      description?: string;
    },
  ): Promise<Optional<{ id: string }>> {
    const meeting = await this.findMeeting(by);

    if (!meeting) return undefined;

    meeting.edit(data);

    this.context.meeting.update({
      where: { id: meeting.getId() },
      data: PrismaMeetingMapper.toOrmEntity(meeting),
    });

    return { id: meeting.getId() };
  }

  public async deleteMeeting(by: {
    id: string;
  }): Promise<Optional<{ id: string }>> {
    const meeting = await this.findMeeting(by);

    if (!meeting) return undefined;
    this.context.meeting.delete({ where: { id: meeting.getId() } });

    return { id: meeting.getId() };
  }

  public async deleteMeetings(by: { ids: string[] }): Promise<string[]> {
    const deleteOptions: Prisma.MeetingDeleteManyArgs = {
      where: { id: { in: by.ids } },
    };
    await this.context.meeting.deleteMany(deleteOptions);
    return by.ids;
  }
}
