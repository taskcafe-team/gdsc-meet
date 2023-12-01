import { RoomType } from "@core/common/enums/RoomEnum";
import { Nullable } from "@core/common/type/CommonTypes";

export interface CreateRoomPort {
  roomId: string;
  roomType: RoomType;
  roomName: string;
  roomMaxParticipants?: number;
  roomTimeout?: number;

  createdAt: Date;
  updatedAt: Nullable<Date>;
  removedAt: Nullable<Date>;
}
