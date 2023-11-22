import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from "@nestjs/common";
import { REQUEST } from "@nestjs/core";

import { Meeting } from "@core/domain/meeting/entity/Meeting";
import { Participant } from "@core/domain/participant/entity/Participant";
import { MeetingUsecaseDto } from "@core/domain/meeting/usecase/dto/MeetingUsecaseDto";
import { UnitOfWork } from "@core/common/persistence/UnitOfWork";
import { ParticipantRole } from "@core/common/enums/ParticipantEnums";
import { MeetingType } from "@core/common/enums/MeetingEnums";
import { HttpResponseWithOptionalUser } from "@application/api/http-rest/auth/type/HttpAuthTypes";
import { WebRTCLivekitService } from "@infrastructure/adapter/webrtc/WebRTCLivekitManagement";
import { RoomType } from "@infrastructure/adapter/webrtc/Types";
import { AppException } from "@core/common/exception/AppException";
import { AppErrors } from "@core/common/exception/AppErrors";
import { MeetingUsecase } from "@core/domain/meeting/usecase/MeetingUsecase";

@Injectable()
export class MeetingService implements MeetingUsecase {
  constructor(
    @Inject(REQUEST)
    private readonly requestWithOptionalUser: HttpResponseWithOptionalUser,
    private readonly unitOfWork: UnitOfWork,
    private readonly webRTCService: WebRTCLivekitService,
  ) {}

  public async createMeeting(payload: {
    title?: string;
    description?: string;
    startDate?: Date;
    endDate?: Date;
    type?: MeetingType;
  }): Promise<MeetingUsecaseDto> {
    return await this.unitOfWork.runInTransaction(async () => {
      const userId = this.requestWithOptionalUser.user?.id;

      const currentuser = await this.unitOfWork
        .getUserRepository()
        .findUser({ id: userId });

      if (!currentuser)
        throw new AppException(AppErrors.ENTITY_NOT_FOUND_ERROR);

      const meeting = await Meeting.new(payload);

      const participant = await Participant.new({
        meetingId: meeting.getId(),
        name: currentuser.fullName(),
        userId: currentuser.getId(),
        role: ParticipantRole.HOST,
      });

      await this.unitOfWork.getMeetingRepository().addMeeting(meeting);
      await this.unitOfWork
        .getParticipantRepository()
        .addParticipant(participant);

      return MeetingUsecaseDto.newFromEntity(meeting);
    });
  }

  public async getMyMeetings(): Promise<Meeting[]> {
    const userId = this.requestWithOptionalUser.user?.id;
    if (!userId) throw new InternalServerErrorException("User not found!");
    const participantWithMyHost = await this.unitOfWork
      .getParticipantRepository()
      .findManyParticipants({
        userId: userId,
        role: ParticipantRole.HOST,
      });
    const myMeetings = participantWithMyHost.map((p) => p.meeting!);
    return myMeetings;
  }

  public async deleteMeetings(payload: { ids: string[] }) {
    return await this.unitOfWork.runInTransaction(async () => {
      const userId = this.requestWithOptionalUser.user?.id;
      if (!userId) throw new InternalServerErrorException("User not found!");
      const meetings = await this.unitOfWork
        .getParticipantRepository()
        .findManyParticipants({
          userId: userId,
          role: ParticipantRole.HOST,
          meetingIds: payload.ids,
        })
        .then((participants) => participants.map((p) => p.meeting!))
        .catch(() => []);
      if (meetings.length !== payload.ids.length)
        throw new BadRequestException("Invalid argument");
      const result = await this.unitOfWork
        .getMeetingRepository()
        .deleteMeetings({ ids: payload.ids });

      const deleteRoomPromise = result.map(async (id) => {
        await this.webRTCService
          .deleteRoom({
            roomId: id,
            roomType: RoomType.MEETING,
          })
          .catch(() => null);
        await this.webRTCService
          .deleteRoom({
            roomId: id,
            roomType: RoomType.WAITING,
          })
          .catch(() => null);
      });
      await Promise.all(deleteRoomPromise);

      return result;
    });
  }

  public async getMeeting(payload: {
    meetingId: string;
  }): Promise<MeetingUsecaseDto> {
    const { meetingId } = payload;
    const meeting = await this.unitOfWork
      .getMeetingRepository()
      .findMeeting({ id: meetingId });
    if (!meeting) throw new NotFoundException("Meeting not found!");
    return MeetingUsecaseDto.newFromEntity(meeting);
  }
}
