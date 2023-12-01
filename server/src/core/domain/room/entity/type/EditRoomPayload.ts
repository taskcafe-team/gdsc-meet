import { OmitBaseEntity } from "@core/common/type/CommonTypes";
import { CreateRoomEntityPayload } from "./CreateRoomEntityPayload";

export type EditRoomEntityPayload = OmitBaseEntity<CreateRoomEntityPayload>;
