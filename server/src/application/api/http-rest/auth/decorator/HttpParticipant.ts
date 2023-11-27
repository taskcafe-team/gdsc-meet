import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { HttpRequestWithParticipant } from "../type/HttpParticipantTypes";
import { AppException } from "@core/common/exception/AppException";
import { AppErrors } from "@core/common/exception/AppErrors";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const HttpParticipant: () => any = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request: HttpRequestWithParticipant = ctx.switchToHttp().getRequest();
    const participant = request.participant;
    if (Boolean(participant)) return participant;
    else throw new AppException(AppErrors.INTERNAL_SERVER_ERROR);
  },
);
