import { WebRTCLivekitService } from "@infrastructure/adapter/webrtc/WebRTCLivekitManagement";

// type SendTo = {
//   chatRoomId: string;
//   recipientId: string[];
// };

// interface IChatService {
//   sendMessage(sendTo: SendTo, message: Message): void;
// }

// class ChatService implements IChatService {
//   constructor(private readonly webRTCLivekitService: WebRTCLivekitService) {}

// async sendMessage(sendTo: SendTo, message: Message) {
// const {chatRoomId} = sendTo;
// const { content, senderId } = message;
// const action = createSendDataMessageAction(
//   SendMessageActionEnum.ParticipantSendMessage,
//   { message: content, sendby: senderId },
// );
// const adapter: SendDataMessagePort = {
//   sendto: {
//     meetingId: chatRoomId,
//     chatRoomId: chatRoomId
//     participantIds: sendto.participantIds,
//   },
//   action,
// };
// await this.webRTCLivekitService.sendDataMessage(adapter);
// }

// public async sendMessage(port: {
//   sendby: { id: string; meetingId: string };
//   sendto: { meetingId: string; participantIds?: string[] };
//   message: string;
// }) {
//   const { sendby, sendto, message } = port;

//   const action = createSendDataMessageAction(
//     SendMessageActionEnum.ParticipantSendMessage,
//     { message, sendby: sendby.id },
//   );

//   const adapter: SendDataMessagePort = {
//     sendto: {
//       meetingId: sendto.meetingId,
//       participantIds: sendto.participantIds,
//     },
//     action,
//   };

//   await this.webRTCService.sendDataMessage(adapter);
// }
// }
