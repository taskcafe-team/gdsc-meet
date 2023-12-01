import { RoomType } from "@core/common/enums/RoomEnum";
import { Nullable } from "@core/common/type/CommonTypes";

export type CreateRoomEntityPayload = {
  type: RoomType;
  name: string;

  id?: string;
  createdAt?: Date;
  updatedAt?: Nullable<Date>;
  removedAt?: Nullable<Date>;
};
