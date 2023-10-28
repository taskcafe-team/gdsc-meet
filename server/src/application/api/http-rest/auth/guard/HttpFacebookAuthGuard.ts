import { AuthGuard } from "@nestjs/passport";
import { Injectable } from "@nestjs/common";

@Injectable()
export class HttpFacebookAuthGuard extends AuthGuard("facebook") {
   
}