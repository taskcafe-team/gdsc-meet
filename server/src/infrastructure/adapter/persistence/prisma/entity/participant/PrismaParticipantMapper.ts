import { Participant } from "@core/domain/participant/entity/Participant";
import { PrismaParticipant } from "./PrismaParticipant";
import { PrismaUserMapper } from "../user/PrismaUserMapper";
import { ParticipantRole } from "@core/common/enums/ParticipantEnums";
import { PrismaMeetingMapper } from "../meeting/PrismaMeetingMapper";

export class PrismaParticipantMapper {
  public static toOrmEntity(domain: Participant): PrismaParticipant {
    const orm: PrismaParticipant = new PrismaParticipant();

    Object.assign(orm, { ...domain });
    orm.user = domain.user && PrismaUserMapper.toOrmEntity(domain.user);
    orm.meeting =
      domain.meeting && PrismaMeetingMapper.toOrmEntity(domain.meeting);

    return orm;
  }

  public static toOrmEntities(listDomains: Participant[]): PrismaParticipant[] {
    return listDomains.map((domainParticipant) =>
      this.toOrmEntity(domainParticipant),
    );
  }

  public static toDomainEntity(orm: PrismaParticipant): Participant {
    const domain: Participant = new Participant({
      id: orm.id,
      userId: orm.userId,
      meetingId: orm.meetingId,
      name: orm.name,
      role: orm.role as ParticipantRole,
      user: orm.user && PrismaUserMapper.toDomainEntity(orm.user),
      meeting: orm.meeting && PrismaMeetingMapper.toDomainEntity(orm.meeting),
      createdAt: orm.createdAt,
      updatedAt: orm.updatedAt,
      removedAt: orm.removedAt,
    });

    return domain;
  }

  public static toDomainEntities(listOrms: PrismaParticipant[]): Participant[] {
    return listOrms.map((orm) => this.toDomainEntity(orm));
  }
}
