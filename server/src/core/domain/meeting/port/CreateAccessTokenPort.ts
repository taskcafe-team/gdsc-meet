import { TrackSource } from "livekit-server-sdk";

export interface CreateAccessTokenPort {
  meetingId: string;
  participantId: string;
  participantName: string;
  roomJoin?: boolean;
  canPublish?: boolean;
  canSubscribe?: boolean;
  roomList?: boolean;
  roomCreate?: boolean;
  canPublishSources?: TrackSource[];
  canPublishData?: boolean;
  hidden?: boolean;
}
