import {
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from "@nestjs/common";

import { Meeting } from "@core/domain/meeting/entity/Meeting";
import { Participant } from "@core/domain/participant/entity/Participant";
import { UnitOfWork } from "@core/common/persistence/UnitOfWork";
import { ParticipantRole } from "@core/common/enums/ParticipantEnums";
import { MeetingUsecase } from "@core/domain/meeting/usecase/MeetingUsecase";
import { CreateMeetingPort } from "@core/domain/meeting/usecase/port/CreateMeetingPort";
import { UserUsecase } from "@core/domain/user/usecase/UserUsecase";
import { UserService } from "./UserService";
import { RoomType } from "@core/common/enums/RoomEnum";
import { RoomService } from "./RoomService";
import { RoomUsecase } from "@core/domain/room/usecase/RoomUsecase";
import { MeetingUsecaseDTO } from "@core/domain/meeting/usecase/dto/MeetingUsecaseDTO";
import { AppException } from "@core/common/exception/AppException";
import { AppErrors } from "@core/common/exception/AppErrors";
import { UpdateMeetingDTO } from "@core/domain/meeting/usecase/dto/UpdateMeetingDTO";
import { RoomUsecaseDTO } from "@core/domain/room/usecase/dtos/RoomUsecaseDTO";

@Injectable()
export class MeetingService implements MeetingUsecase {
  constructor(
    private readonly unitOfWork: UnitOfWork,
    @Inject(UserService) private readonly userService: UserUsecase,
    @Inject(RoomService) private readonly roomService: RoomUsecase,
  ) {}

  public async createMeeting(
    createrId: string,
    payload: CreateMeetingPort,
  ): Promise<MeetingUsecaseDTO> {
    return await this.unitOfWork.runInTransaction(async () => {
      const user = await this.userService.getUserById(createrId);

      const meeting = await Meeting.new(payload);
      const fullName = user.firstName ?? "" + " " + user.lastName ?? "";
      const participant = await Participant.new({
        meetingId: meeting.id,
        name: fullName.trim(),
        userId: user.id,
        role: ParticipantRole.HOST,
      });

      await this.unitOfWork.getMeetingRepository().addMeeting(meeting);
      await this.unitOfWork
        .getParticipantRepository()
        .addParticipant(participant);

      return MeetingUsecaseDTO.newFromEntity(meeting);
    });
  }

  public async updateMeeting(
    meetingId: string,
    dto: UpdateMeetingDTO,
  ): Promise<void> {
    const meeting = await this.unitOfWork
      .getMeetingRepository()
      .findMeeting({ id: meetingId });
    if (!meeting) throw new NotFoundException("Meeting not found!");
    await meeting.edit(dto);
    await this.unitOfWork
      .getMeetingRepository()
      .updateMeeting({ id: meetingId }, meeting);
  }

  getAllMeetings(): Promise<Meeting[]> {
    throw new Error("Method not implemented.");
  }

  getMeetingsByUserId(userId: string): Promise<Meeting[]> {
    throw new Error("Method not implemented.");
  }

  async createMeetingRooms(meetingId: string): Promise<{
    waitingRoom: RoomUsecaseDTO;
    meetingRoom: RoomUsecaseDTO;
  }> {
    const waitingRoomname = `${RoomType.WAITING}:${meetingId}`;
    const meetingRoomname = `${RoomType.MEETING}:${meetingId}`;
    const waitingRoom = await this.roomService.createRoom({
      type: RoomType.WAITING,
      name: waitingRoomname,
    });
    const meetingRoom = await this.roomService.createRoom({
      type: RoomType.MEETING,
      name: meetingRoomname,
    });
    return { waitingRoom, meetingRoom };
  }

  async createMeetingRoom(
    meetingId: string,
    roomType: RoomType,
  ): Promise<RoomUsecaseDTO> {
    const roomname = `${roomType}:${meetingId}`;
    return this.roomService.createRoom({ type: roomType, name: roomname });
  }

  async getMeetingRoom(
    meetingId: string,
    roomType: RoomType,
  ): Promise<RoomUsecaseDTO> {
    const roomname = `${roomType}:${meetingId}`;
    const rooms = await this.roomService.getRoomByName(roomname);
    const [room] = await this.roomService.getRoomByName(roomname);
    if (!room) throw new NotFoundException(`Room not found!`);
    return room;
  }

  async getMeetingRooms(meetingId: string): Promise<{
    waitingRoom: RoomUsecaseDTO;
    meetingRoom: RoomUsecaseDTO;
  }> {
    const meeting = await this.getMeetingById(meetingId);
    const waitingRoomname = `${RoomType.WAITING}:${meeting.id}`;
    const meetingRoomname = `${RoomType.MEETING}:${meeting.id}`;
    const [waitingRoom] = await this.roomService.getRoomByName(waitingRoomname);
    const [meetingRoom] = await this.roomService.getRoomByName(meetingRoomname);
    if (!waitingRoom || !meetingRoom)
      throw new NotFoundException(`Room not found!`);
    return { waitingRoom, meetingRoom };
  }

  async getOrCreateMeetingRooms(
    meetingId: string,
  ): Promise<{ waitingRoom: RoomUsecaseDTO; meetingRoom: RoomUsecaseDTO }> {
    const meetingRoom = await this.getMeetingRoom(
      meetingId,
      RoomType.MEETING,
    ).catch(() => this.createMeetingRoom(meetingId, RoomType.MEETING));
    const waitingRoom = await this.getMeetingRoom(
      meetingId,
      RoomType.WAITING,
    ).catch(() => this.createMeetingRoom(meetingId, RoomType.WAITING));
    return { waitingRoom, meetingRoom };
  }

  public async getMeetingById(id: string): Promise<MeetingUsecaseDTO> {
    const res = await this.unitOfWork
      .getMeetingRepository()
      .findMeeting({ id });
    if (!res) throw new NotFoundException("Meeting not found!");
    return MeetingUsecaseDTO.newFromEntity(res);
  }

  public async getMyMeetings(getter: string): Promise<MeetingUsecaseDTO[]> {
    const userId = getter;
    if (!userId) throw new InternalServerErrorException("User not found!");
    const participantWithMyHost = await this.unitOfWork
      .getParticipantRepository()
      .findManyParticipants({
        userId: userId,
        role: ParticipantRole.HOST,
      });
    const myMeetings = participantWithMyHost.map((p) => {
      if (!p.meeting) throw new AppException(AppErrors.ENTITY_NOT_FOUND_ERROR);
      return MeetingUsecaseDTO.newFromEntity(p.meeting);
    });
    return myMeetings;
  }

  async deleteMeetingById(id: string): Promise<{ id: string }> {
    await this.getMeetingById(id);
    const waitingRoomname = `${RoomType.WAITING}:${id}`;
    const meetingRoomname = `${RoomType.MEETING}:${id}`;
    await this.roomService.deleteRoomByName(waitingRoomname).catch(() => null);
    await this.roomService.deleteRoomByName(meetingRoomname).catch(() => null);
    await this.unitOfWork.getMeetingRepository().deleteMeeting({ id });
    return { id };
  }

  async deleteMeetings(ids: string[]): Promise<{ ids: string[] }> {
    for (const id of ids) await this.deleteMeetingById(id);
    return { ids };
  }
}
