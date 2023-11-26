import { Module } from "@nestjs/common";
import { InfrastructureModule } from "./InfrastructureModule";
import { FileController } from "@application/api/http-rest/controller/FileController";
import { PrismaClient } from "@prisma/client";
import { FolderController } from "@application/api/http-rest/controller/FolderController";
import { UserMeetingController } from "@application/api/http-rest/controller/UserMeetingController";
import { UserFoldersController } from "@application/api/http-rest/controller/UserFolderController";
import { FileService } from "@application/services/FileService";
import { FolderService } from "@application/services/FolderService";
import { UserMeetingService } from "@application/services/UserMeetingService";
import { MeetingService } from "@application/services/MeetingService";
import { ParticipantService } from "@application/services/ParticipantService";
import { UserFolderService } from "@application/services/UserFolderService";
import { UserService } from "@application/services/UserService";

@Module({
    controllers: [FileController, FolderController, UserMeetingController, UserFoldersController],
    imports: [InfrastructureModule],
    providers: [FileService, PrismaClient, FolderService, UserMeetingService, MeetingService, ParticipantService, UserFolderService, UserService],
    exports: [FileService, FolderService, UserMeetingService, MeetingService, ParticipantService],
})
export class FileManagementModule { }