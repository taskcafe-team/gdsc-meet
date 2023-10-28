import { GenerateLivekitJWT } from "@infrastructure/adapter/usecase/webrtc/livekit/GenerateLivekitJWT";
import { Controller, Get, Post } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";


@Controller("livekit")
@ApiTags("livekit") 
export class LivekitController{
    constructor(private generateLivekitJWT: GenerateLivekitJWT){}
    @Get("getJWT")
    public async getJWT(){
        return this.generateLivekitJWT.createToken()
    }
    @Get("createRoom")
    public async createRoom(){
        return this.generateLivekitJWT.createRoom()
    }
}