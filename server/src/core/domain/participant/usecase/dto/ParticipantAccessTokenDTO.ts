import { ParticipantRole } from "@core/common/enums/ParticipantEnums";
import { RoomType } from "@core/common/enums/RoomEnum";
import { Nullable } from "@core/common/type/CommonTypes";

export class ParticipantAccessTokenDTO {
  roomId: string;
  roomName: Nullable<string>;
  roomType: RoomType;
  participant: {
    id: string;
    name: string;
    meetingId: string;
    userId: Nullable<string>;
    role: ParticipantRole;
    avatar: string;
  };
}
