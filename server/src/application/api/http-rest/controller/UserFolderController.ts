import { CoreApiResponse } from "@core/common/api/CoreApiResponse";
import { UserFolderService } from "@core/services/user-folder/UserFolderService";
import { Body, Controller, Get, Post } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";

@Controller("user-folders")
@ApiTags("user-folders")
export class UserFoldersController {
    constructor(private readonly userSubjectService: UserFolderService) { }
    // Start API for User Subject

    // @Get("")
    // public async getUserSubjects(): Promise<UserFolder[]> {
    //     const result = await this.userSubjectService.getAllUserMeeting();
    //     return result
    // }
    // This end-point to create the connection between User And Subject
    // Example for testing with postman: http://localhost:8080/subjects/create-user-subject
    // Need to input value into 2 fields: userid, subjectId in Body Tag
    @Post("")
    public async createUserMeeting(@Body() { userId, folderId }: { userId: string, folderId: string }) {
        console.log(userId + " " + folderId)
        const result = await this.userSubjectService.createUserFolder(userId, folderId);

        return CoreApiResponse.success(result);
    }
    // End API for User Subject
}