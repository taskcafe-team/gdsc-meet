import { ParticipantInfo as LivekitParticipant } from "livekit-server-sdk";
import { Participant } from "@core/domain/participant/entity/Participant";
import { LivekitParticipantMetadata } from "../types/LivekitParticipantMetadata";

export class LivekitParticipantMapper {
  static toDomainEntity(
    livekitEntity: LivekitParticipant,
  ): Promise<Participant> {
    const { metadata } = livekitEntity;
    const metaObj = JSON.parse(metadata) as LivekitParticipantMetadata;
    return Participant.new({
      id: metaObj.id,
      meetingId: metaObj.meetingId,
      name: metaObj.name,
      userId: metaObj.userId,
      role: metaObj.role,
    });
  }

  static toDomainEntities(
    livekitEntities: LivekitParticipant[],
  ): Promise<Participant[]> {
    return Promise.all(livekitEntities.map(this.toDomainEntity));
  }
}
