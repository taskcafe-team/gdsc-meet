import { Meeting } from "@core/domain/meeting/entity/Meeting";
import { PrismaMeeting } from "./PrismaMeeting";
import { MeetingType } from "@core/common/enums/MeetingEnums";
import { CreateMeetingEntityPayload } from "@core/domain/meeting/entity/type/CreateMeetingEntityPayload";

export class PrismaMeetingMapper {
  public static toOrmEntity(domain: Meeting): PrismaMeeting {
    const orm: PrismaMeeting = new PrismaMeeting();

    Object.assign(orm, { ...domain });
    return orm as PrismaMeeting;
  }

  public static toOrmEntities(listDomains: Meeting[]): PrismaMeeting[] {
    return listDomains.map((domain) => this.toOrmEntity(domain));
  }

  public static toDomainEntity(orm: PrismaMeeting): Meeting {
    const domain: Meeting = new Meeting({
      id: orm.id,
      startTime: orm.startTime,
      endTime: orm.endTime ?? undefined,
      title: orm.title ?? undefined,
      description: orm.description ?? undefined,
      type: orm.type as MeetingType,
      createdAt: orm.createdAt,
      updatedAt: orm.updatedAt ?? undefined,
      removedAt: orm.removedAt ?? undefined,
    });

    return domain as Meeting;
  }

  public static toDomainEntities(listOrms: PrismaMeeting[]): Meeting[] {
    return listOrms.map((orm) => this.toDomainEntity(orm));
  }
}
