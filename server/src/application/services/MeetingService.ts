import {
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";

import { Meeting } from "@core/domain/meeting/entity/Meeting";
import { Participant } from "@core/domain/participant/entity/Participant";
import { MeetingUsecaseDto } from "@core/domain/meeting/usecase/dto/MeetingUsecaseDto";
import { UnitOfWork } from "@core/common/persistence/UnitOfWork";
import { ParticipantRole } from "@core/common/enums/ParticipantEnums";
import { WebRTCLivekitService } from "@infrastructure/adapter/webrtc/WebRTCLivekitManagement";
import { RoomType } from "@infrastructure/adapter/webrtc/Types";
import { MeetingUsecase } from "@core/domain/meeting/usecase/MeetingUsecase";
import { CreateMeetingPort } from "@core/domain/meeting/usecase/port/CreateMeetingPort";
import { UserUsecase } from "@core/domain/user/usecase/UserUsecase";
import { UserService } from "./UserService";
import { UpdateMeetingPort } from "@core/domain/meeting/usecase/port/UpdateMeetingPort";

@Injectable()
export class MeetingService implements MeetingUsecase {
  constructor(
    @Inject(UserService)
    private readonly userService: UserUsecase,
    private readonly unitOfWork: UnitOfWork,
    private readonly webRTCService: WebRTCLivekitService,
  ) {}

  public async createMeeting(
    createrId: string,
    payload: CreateMeetingPort,
  ): Promise<MeetingUsecaseDto> {
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

      let roomttlSecond: number | undefined;
      if (meeting.endTime)
        roomttlSecond =
          (meeting.endTime.getTime() - new Date().getTime()) / 1000;

      await this.webRTCService.createRoom({
        roomId: meeting.id,
        roomType: RoomType.MEETING,
        emptyTimeout: roomttlSecond,
      });
      await this.unitOfWork.getMeetingRepository().addMeeting(meeting);
      await this.unitOfWork
        .getParticipantRepository()
        .addParticipant(participant);

      return MeetingUsecaseDto.newFromEntity(meeting);
    });
  }

  getAllMeetings(): Promise<Meeting[]> {
    throw new Error("Method not implemented.");
  }

  getMeetingsByUserId(payload: { userId: string }): Promise<Meeting[]> {
    throw new Error("Method not implemented.");
  }

  public async getMeetingById(id: string): Promise<MeetingUsecaseDto> {
    const res = await this.unitOfWork
      .getMeetingRepository()
      .findMeeting({ id });
    if (!res) throw new NotFoundException("Meeting not found!");
    return MeetingUsecaseDto.newFromEntity(res);
  }

  public async getMeeting(id: string): Promise<MeetingUsecaseDto> {
    const meeting = await this.unitOfWork
      .getMeetingRepository()
      .findMeeting({ id });
    if (!meeting) throw new NotFoundException("Meeting not found!");
    return MeetingUsecaseDto.newFromEntity(meeting);
  }

  public async getMyMeetings(getter: string): Promise<MeetingUsecaseDto[]> {
    const userId = getter;
    if (!userId) throw new InternalServerErrorException("User not found!");
    const participantWithMyHost = await this.unitOfWork
      .getParticipantRepository()
      .findManyParticipants({
        userId: userId,
        role: ParticipantRole.HOST,
      });
    const myMeetings = participantWithMyHost.map((p) =>
      MeetingUsecaseDto.newFromEntity(p.meeting!),
    );
    return myMeetings;
  }

  async updateMeeting(
    updateId: string,
    payload: UpdateMeetingPort,
  ): Promise<void> {
    const meeting = await this.unitOfWork
      .getMeetingRepository()
      .findMeeting({ id: updateId });
    if (!meeting) throw new NotFoundException("Meeting not found!");

    await meeting.edit(payload);
    await this.unitOfWork
      .getMeetingRepository()
      .updateMeeting({ id: meeting.id }, meeting);
  }

  async deleteMeetingById(id: string): Promise<string> {
    await this.unitOfWork.getMeetingRepository().deleteMeeting({ id });
    await this.webRTCService
      .deleteRoom({ roomId: id, roomType: RoomType.MEETING })
      .catch(() => null);
    return id;
  }

  async deleteMeetings(ids: string[]): Promise<string[]> {
    return await this.unitOfWork.runInTransaction(async () => {
      return await this.unitOfWork
        .getMeetingRepository()
        .deleteMeetings({ ids });
    });
  }
}
