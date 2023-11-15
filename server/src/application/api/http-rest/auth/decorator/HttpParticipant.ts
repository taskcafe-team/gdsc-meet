import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { HttpRequestWithParticipant } from "../type/HttpParticipantTypes";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const HttpParticipant: () => any = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request: HttpRequestWithParticipant = ctx.switchToHttp().getRequest();
    return request.participant;
  },
);
