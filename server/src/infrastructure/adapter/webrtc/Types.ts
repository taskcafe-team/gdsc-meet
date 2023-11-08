import { SendDataOptions, TrackSource } from "livekit-server-sdk";

export enum SendDataMessageMeetingAction {
  request_join = "meeting:request_join",
  leave = "meeting:leave",
  message = "meeting:message",
  error = "meeting:error",
}

export type SendDataMessageAction = SendDataMessageMeetingAction;

export interface SendMessagesStatus {
  code: string;
  message: string;
}

export interface SendDataMessageDTO<T = any> {
  action: SendDataMessageAction;
  // status?: SendMessagesStatus;
  data?: T;
}

export interface SendtoOptions {
  meetingId: string;
  participantIds: SendDataOptions["destinationIdentities"];
}

export interface SendMessagePayload<T = unknown> {
  sendto: SendtoOptions;
  payload: SendDataMessageDTO<T>;
}
