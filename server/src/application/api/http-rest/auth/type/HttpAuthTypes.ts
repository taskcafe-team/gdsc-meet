import { UserRole } from "@core/common/enums/UserEnums";
import { Request } from "express";

export type HttpUserPayload = {
  id: string;
  role: UserRole;
  isValid: boolean;
};

export type HttpJwtPayload = {
  id: string;
};

export type HttpLoggedInUser = {
  id: string;
  accessToken: string;
  refreshToken: string;
};

export type HttpRequestWithUser = Request & { user: HttpUserPayload };
export type HttpResponseWithOptionalUser = Request & {
  user?: HttpUserPayload;
};
