import { EnvironmentVariablesConfig } from "@infrastructure/config/EnvironmentVariablesConfig";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { AccessToken } from "livekit-server-sdk";
import { RoomServiceClient, Room } from 'livekit-server-sdk';

@Injectable()
export class GenerateLivekitJWT{
    constructor(
      private configService: ConfigService<EnvironmentVariablesConfig>,
      ){   
    }
  
    //Creating a token for participant to join a room
    public createToken = () => {
        // if this room doesn't exist, it'll be automatically created when the first
        // client joins
        // Nếu phòng chưa tồn tại thì sẽ tự động tạo phòng khi người đầu tiên vào phòng
        const roomName = 'quickstart-room';
        // identifier to be used for participant.
        // it's available as LocalParticipant.identity with livekit-client SDK
        const participantName = 'quickstart-username';
        const apiKey = this.configService.get("LK_API_KEY");
        const secretKey = this.configService.get("LK_API_KEY");
        const at = new AccessToken(apiKey, secretKey, {
          identity: participantName,
        });
        at.addGrant({ roomJoin: true, room: roomName });
      
        return at.toJwt();
    }
    public createRoom = async () => {
      const opts = {
        name: 'myroom',
        emptyTimeout: 10 * 60, // 10 minutes
        maxParticipants: 20,
      };
      const livekitHost = 'http://localhost:8080';
      const apiKey = this.configService.get("LK_API_KEY");
      const secretKey = this.configService.get("LK_API_SECRET");
      const roomService = new RoomServiceClient(livekitHost, apiKey, secretKey);
    
      try {
        const room = await roomService.createRoom(opts);
        console.log('room created', room);
        return room;
      } catch (error) {
        console.error('Failed to create room', error);
        throw error;
      }
    }
}