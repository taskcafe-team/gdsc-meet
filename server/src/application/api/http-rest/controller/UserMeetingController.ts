import { UserMeetingService } from "@application/services/UserMeetingService";
import { CoreApiResponse } from "@core/common/api/CoreApiResponse";

import { Body, Controller, Get, Post } from "@nestjs/common";
import { ApiBody, ApiTags } from "@nestjs/swagger";
import { UserMeeting } from "@prisma/client";

@Controller("user-meetings")
@ApiTags("user-meetings")
export class UserMeetingController {
    constructor(private readonly userSubjectService: UserMeetingService) { }
    // Start API for User Subject

    @Get("")
    public async getUserSubjects(): Promise<UserMeeting[]> {
        const result = await this.userSubjectService.getAllUserMeeting();
        return result
    }
    // This end-point to create the connection between User And Subject
    // Example for testing with postman: http://localhost:8080/subjects/create-user-subject
    // Need to input value into 2 fields: userid, subjectId in Body Tag

    
    @Post("")
    @ApiBody({ 
        schema: { 
            properties: { 
                userId: { type: 'string' },
                meetingId: { type: 'string' },
            },
        },
    })
    public async createUserMeeting(@Body() { userId, meetingId }: { userId: string, meetingId: string }) {
        const result = await this.userSubjectService.createUserMeeting(userId, meetingId);
        return CoreApiResponse.success(result);
    }
    // End API for User Subject
}