import { RoomType } from "@core/common/enums/RoomEnum";
import { Nullable } from "@core/common/type/CommonTypes";

export class LivekitRoomMetadata {
  roomName: string;
  roomType: RoomType;

  createdAt: Date;
  updatedAt: Nullable<Date>;
  removedAt: Nullable<Date>;
}
