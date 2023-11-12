import { Request } from "express";

export type HttpRequestWithParticpant = Request & {
  participant: {
    id: string;
    meetingId: string;
  };
};
