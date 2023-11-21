import { Module } from "@nestjs/common";
import { InfrastructureModule } from "./InfrastructureModule";
import { FileController } from "@application/api/http-rest/controller/FileController";
import { FileService } from "@core/services/file/FileService";
import { PrismaClient } from "@prisma/client";
import { FolderService } from "@core/services/folder/FolderService";
import { UserMeetingService } from "@core/services/user-meeting/UserMeetingService";
import { FolderController } from "@application/api/http-rest/controller/FolderController";
import { UserMeetingController } from "@application/api/http-rest/controller/UserMeetingController";
import { MeetingService } from "@core/services/meeting/MeetingService";
import ParticipantService from "@core/services/participant/ParticipantService";
import { UserFoldersController } from "@application/api/http-rest/controller/UserFolderController";
import { UserFolderService } from "@core/services/user-folder/UserFolderService";

@Module({
    controllers: [FileController, FolderController, UserMeetingController, UserFoldersController],
    imports: [InfrastructureModule],
    providers: [FileService, PrismaClient, FolderService, UserMeetingService, MeetingService, ParticipantService, UserFolderService],
    exports: [FileService, FolderService, UserMeetingService, MeetingService, ParticipantService],
})
export class FileManagementModule { }