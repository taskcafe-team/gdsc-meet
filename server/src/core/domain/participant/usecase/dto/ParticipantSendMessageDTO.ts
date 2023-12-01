export class ParticipantSendMessageDTO {
  senderId: string;
  sendTo: {
    roomId: string;
    partIds?: string[];
  };
  content: string;
}
