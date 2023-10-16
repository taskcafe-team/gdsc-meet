import { CreateParticipantPort } from "./CreateParticipantPort";

export interface UpdateParticipantPort {
  by: { id: string };
  data: CreateParticipantPort;
}
