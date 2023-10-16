import { CreateParticipantPort } from "./CreateParticipantPort";

export interface GetOrCreateParticipantPort {
  data: CreateParticipantPort & { id?: string };
}
