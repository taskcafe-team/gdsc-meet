import { Entity } from "@core/common/entity/Entity";
import { RoomType } from "@core/common/enums/RoomEnum";
import { IsEnum, IsString } from "class-validator";
import { CreateRoomEntityPayload } from "./type/CreateRoomEntityPayload";
import { EditRoomEntityPayload } from "./type/EditRoomPayload";

export class Room extends Entity {
  @IsEnum(RoomType) private _type: RoomType;
  @IsString() private _name: string;

  constructor(payload: CreateRoomEntityPayload) {
    super(payload.id, payload.createdAt, payload.updatedAt, payload.removedAt);
    this._type = payload.type;
    this._name = payload.name;
  }

  // Getters
  public get type(): RoomType {
    return this._type;
  }
  public get name(): string {
    return this._name;
  }

  // Methods
  public async edit(payload: EditRoomEntityPayload): Promise<void> {
    if (payload.type !== undefined) this._type = payload.type;
    if (payload.name !== undefined) this._name = payload.name;
    if (payload.name !== undefined || payload.type !== undefined) {
      this._updatedAt = new Date();
    }

    await this.validate();
  }

  static async new(payload: CreateRoomEntityPayload) {
    const room = new Room(payload);
    await room.validate();
    return room;
  }
}
