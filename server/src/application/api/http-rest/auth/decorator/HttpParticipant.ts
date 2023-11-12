import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { HttpRequestWithParticpant } from "../type/HttpParticipantTypes";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const HttpParticipant: () => any = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request: HttpRequestWithParticpant = ctx.switchToHttp().getRequest();
    return request.participant;
  },
);
