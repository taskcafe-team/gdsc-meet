import { Meeting } from "@core/domain/meeting/entity/Meeting";
import { PrismaMeeting } from "./PrismaMeeting";
import { MeetingType } from "@core/common/enums/MeetingEnums";

export class PrismaMeetingMapper {
  public static toOrmEntity(domain: Meeting): PrismaMeeting {
    const orm = new PrismaMeeting();
    orm.id = domain.id;
    orm.startTime = domain.startTime;
    orm.endTime = domain.endTime;
    orm.title = domain.title;
    orm.description = domain.description;
    orm.type = domain.type;
    orm.createdAt = domain.createdAt;
    orm.updatedAt = domain.updatedAt ?? null;
    orm.removedAt = domain.removedAt ?? null;
    return orm;
  }

  public static toOrmEntities(listDomains: Meeting[]): PrismaMeeting[] {
    return listDomains.map((domain) => this.toOrmEntity(domain));
  }

  public static toDomainEntity(orm: PrismaMeeting): Meeting {
    const domain = new Meeting({
      id: orm.id,
      startTime: orm.startTime,
      endTime: orm.endTime,
      title: orm.title,
      description: orm.description,
      type: orm.type as MeetingType,
      createdAt: orm.createdAt,
      updatedAt: orm.updatedAt ?? undefined,
      removedAt: orm.removedAt ?? undefined,
    });
    return domain;
  }

  public static toDomainEntities(listOrms: PrismaMeeting[]): Meeting[] {
    return listOrms.map((orm) => this.toDomainEntity(orm));
  }
}
