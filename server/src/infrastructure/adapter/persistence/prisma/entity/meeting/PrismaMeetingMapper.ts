import { Meeting } from "@core/domain/meeting/entity/Meeting";
import { PrismaMeeting } from "./PrismaMeeting";

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
    const domain: Meeting = new Meeting({ ...orm });

    return domain as Meeting;
  }

  public static toDomainEntities(listOrms: PrismaMeeting[]): Meeting[] {
    return listOrms.map((orm) => this.toDomainEntity(orm));
  }
}
