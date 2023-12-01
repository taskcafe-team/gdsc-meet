import { RoomType } from "@core/common/enums/RoomEnum";

export type CreateRoomDTO = {
  type: RoomType;
  name: string;
};
