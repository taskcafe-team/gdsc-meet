import { RoomType } from "@core/common/enums/RoomEnum";

export type LivekitRoomMetaData = {
  roomType: RoomType;
  roomName: string;
};

// export type RoomDto = {
//   id: string;
//   type: RoomType;
// };
// export type AccessTokenMetadata = ParticipantUsecaseDto & {
//   room: RoomDto;
// };

// export type SendtoOptions = {
//   roomId: string;
//   roomType: RoomType;
//   participantIds?: SendDataOptions["destinationIdentities"];
// };

// export type SendDataMessagePort = {
//   sendto: SendtoOptions;
//   action: ReturnType<typeof createSendDataMessageAction>;
// };

// export type ParticipantAccessToken = {
//   id: string;
//   meetingId: string;
//   participantRole: ParticipantRole;
// };

// export type Message = {
//   roomId: string;
//   roomType: RoomType;
//   senderId: string;
//   content: string;
// };

// // ----- Dtos ----- //
// export type ParticipantGetAccessTokenDTO = {
//   participantId: string;
//   participantRole: ParticipantRole;
//   meetingId: string;
//   tokens: string[];
// };

// export enum RespondJoinStatus {
//   ACCEPTED = "accepted",
//   REJECTED = "rejected",
//   PENDING = "pending",
// }

// export type ParticipantRequestJoinDto = {
//   status: RespondJoinStatus;
//   token?: CreateTokenDto;
// };

// export type ParticipantSendMessageDto = Message;
