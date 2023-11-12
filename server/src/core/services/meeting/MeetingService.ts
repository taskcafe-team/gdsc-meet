import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from "@nestjs/common";
import { REQUEST } from "@nestjs/core";

import { Meeting } from "@core/domain/meeting/entity/Meeting";
import { WebRTCLivekitService } from "@infrastructure/adapter/webrtc/WebRTCLivekitManagement";
import { Exception } from "@core/common/exception/Exception";
import Code from "@core/common/constants/Code";
import { Participant } from "@core/domain/participant/entity/Participant";
import { MeetingUsecaseDTO } from "@core/domain/meeting/usecase/MeetingUsecaseDTO";
import { UnitOfWork } from "@core/common/persistence/UnitOfWork";
import { ParticipantRole } from "@core/common/enums/ParticipantEnums";
import { MeetingType } from "@core/common/enums/MeetingEnums";
import { ParticipantUsecaseDTO } from "@core/domain/participant/usecase/dto/ParticipantUsecaseDTO";
import { HttpResponseWithOptionalUser } from "@application/api/http-rest/auth/type/HttpAuthTypes";
import { CreateAccessTokenPort } from "@core/domain/meeting/port/CreateAccessTokenPort";

@Injectable()
export class MeetingService {
  constructor(
    @Inject(REQUEST)
    private readonly requestWithOptionalUser: HttpResponseWithOptionalUser,
    private readonly webRTCService: WebRTCLivekitService,
    private readonly unitOfWork: UnitOfWork,
  ) {}

  public async createMeeting(payload: {
    title?: string;
    description?: string;
    startDate?: Date;
    endDate?: Date;
    type?: MeetingType;
  }): Promise<MeetingUsecaseDTO> {
    return await await await await this.unitOfWork.runInTransaction(
      async () => {
        const userId = this.requestWithOptionalUser.user?.id;

        const currentuser = await this.unitOfWork
          .getUserRepository()
          .findUser({ id: userId });

        if (!currentuser) throw Exception.newFromCode(Code.NOT_FOUND_ERROR);

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
      },
    );
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

  public async getAccessToken(payload: { meetingId: string }) {
    return await this.unitOfWork.runInTransaction(async () => {
      const { meetingId } = payload;
      // Get Current User
      const currentUser = await this.unitOfWork
        .getUserRepository()
        .findUser({ id: this.requestWithOptionalUser.user?.id });
      if (!currentUser) throw new NotFoundException("User not found!");

      // Get meeting by friendlyId in Cache
      const meeting = await this.getMeeting({ meetingId });

      // Get or create participant
      let participant = await this.unitOfWork
        .getParticipantRepository()
        .findParticipant({
          userId: currentUser.getId(),
          meetingId: meeting.id,
        });

      if (!participant) {
        participant = await Participant.new({
          meetingId: meeting.id,
          name: currentUser.fullName(),
          role: ParticipantRole.PARTICIPANT,
          userId: currentUser.getId(),
        });
      }
      const participantDTO = ParticipantUsecaseDTO.newFromEntity(participant);

      // create token
      return await this.createAccessToken(meeting, participantDTO);
    });
  }

  // private methods
  private async createAccessToken(
    meeting: MeetingUsecaseDTO,
    participant: ParticipantUsecaseDTO,
  ) {
    let status = "JOIN";
    const createAccessTokenPayload: CreateAccessTokenPort = {
      meetingId: meeting.id,
      participantId: participant.id,
      participantName: participant.name === "" ? "Anonymous" : participant.name,
      roomJoin: true,
      canPublish: true,
      canSubscribe: true,
      canPublishData: true,
      hidden: false,
    };

    if (meeting.type === MeetingType.PUBLIC) {
    } else if (meeting.type === MeetingType.PRIVATE) {
      // Check if the user has already subscribed to the meeting
      const participantExits = await this.unitOfWork
        .getParticipantRepository()
        .findParticipant({ id: participant.id });

      if (!participantExits) {
        status = "WAIT";
        createAccessTokenPayload.canPublish = false;
        createAccessTokenPayload.canSubscribe = false;
        createAccessTokenPayload.canPublishData = false;
        createAccessTokenPayload.hidden = true;
      }
    }

    const token = await this.webRTCService.createToken(
      createAccessTokenPayload,
      participant,
    );

    return {
      permissions: {
        status,
      },
      token,
    };
  }
}
