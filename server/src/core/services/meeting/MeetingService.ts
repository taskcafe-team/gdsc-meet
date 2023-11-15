import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from "@nestjs/common";
import { REQUEST } from "@nestjs/core";

import { Meeting } from "@core/domain/meeting/entity/Meeting";
import { Exception } from "@core/common/exception/Exception";
import Code from "@core/common/constants/Code";
import { Participant } from "@core/domain/participant/entity/Participant";
import { MeetingUsecaseDTO } from "@core/domain/meeting/usecase/MeetingUsecaseDTO";
import { UnitOfWork } from "@core/common/persistence/UnitOfWork";
import { ParticipantRole } from "@core/common/enums/ParticipantEnums";
import { MeetingType } from "@core/common/enums/MeetingEnums";
import { HttpResponseWithOptionalUser } from "@application/api/http-rest/auth/type/HttpAuthTypes";

@Injectable()
export class MeetingService {
  constructor(
    @Inject(REQUEST)
    private readonly requestWithOptionalUser: HttpResponseWithOptionalUser,
    private readonly unitOfWork: UnitOfWork,
  ) {}

  public async createMeeting(payload: {
    title?: string;
    description?: string;
    startDate?: Date;
    endDate?: Date;
    type?: MeetingType;
  }): Promise<MeetingUsecaseDTO> {
    return await this.unitOfWork.runInTransaction(async () => {
      const userId = this.requestWithOptionalUser.user?.id;

      const currentuser = await this.unitOfWork
        .getUserRepository()
        .findUser({ id: userId });

      if (!currentuser) throw new Exception(Code.ENTITY_NOT_FOUND_ERROR);

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

      return MeetingUsecaseDTO.newFromEntity(meeting);
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
      return await this.unitOfWork
        .getMeetingRepository()
        .deleteMeetings({ ids: payload.ids });
    });
  }

  public async getMeeting(payload: {
    meetingId: string;
  }): Promise<MeetingUsecaseDTO> {
    const { meetingId } = payload;
    const meeting = await this.unitOfWork
      .getMeetingRepository()
      .findMeeting({ id: meetingId });
    if (!meeting) throw new NotFoundException("Meeting not found!");
    return MeetingUsecaseDTO.newFromEntity(meeting);
  }
}
