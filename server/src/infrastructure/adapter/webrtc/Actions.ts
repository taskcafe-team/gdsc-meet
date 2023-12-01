import { LivekitParticipantRequestJoinDTO } from "./dtos/LivekitParticipantRequestJoinDTO";
import { LivekitParticipantSendMessageDTO } from "./dtos/LivekitParticipantSendMessageDTO";

type ActionMap = {
  [key in keyof SendMessageActionEnum]: any;
};

export enum SendMessageActionEnum {
  ParticipantRequestJoin = "participant_request_join",
  ParticipantSendMessage = "participant_send_message",
}

export interface RegisterActionsType extends ActionMap {
  [SendMessageActionEnum.ParticipantRequestJoin]: LivekitParticipantRequestJoinDTO;
  [SendMessageActionEnum.ParticipantSendMessage]: LivekitParticipantSendMessageDTO;
}

export function createSendDataMessageAction<
  T extends keyof RegisterActionsType,
>(type: T, payload: RegisterActionsType[T]) {
  return { type, payload };
}
