import { AuthGuard } from "@nestjs/passport";
import { Injectable } from "@nestjs/common";

@Injectable()
export class HttpGoogleOAuthGuard extends AuthGuard("google") {
  constructor() {
    super({ prompt: "select_account" });
  }
}
