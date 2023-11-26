import { Injectable } from "@nestjs/common";
import { Folder, Prisma, PrismaClient, UserFolder } from "@prisma/client";
import { InsertFolderDTO } from "@core/domain/folder/usecase/dto/FolderUseCaseDto";
import { UserMeetingService } from "./UserMeetingService";
import { ParticipantService } from "./ParticipantService";
import { MeetingService } from "./MeetingService";


@Injectable()
export class FolderService {
    constructor(
        private readonly prismaClient: PrismaClient,
        private readonly userMeetingService: UserMeetingService,
        private readonly meetingService: MeetingService,
        private readonly participantService: ParticipantService) { }

    public async findAllFolder(): Promise<Folder[]> {
        return this.prismaClient.folder.findMany();
    }
    
    public async getAllFolderByUserId(userId: string): Promise<Folder[]> {
        console.log(userId)
        const userFolders = await this.prismaClient.userFolder.findMany({
            where: {
                userId: userId,
            },
        });

        const folderIds = userFolders.map((folder) => folder.folderId);
        console.log(folderIds)
        const records = await this.prismaClient.folder.findMany({
            where: {
                id: {
                    in: folderIds,
                },
            },
        });
        console.log(records)
        return records;
    }

    public async findFolderRootById(userMeetingId: string): Promise<Folder | null> {
        if (userMeetingId === undefined) {
            // Xử lý lỗi hoặc trả về giá trị mặc định nếu tham số là undefined
            throw new Error("Invalid parameters.");
        }
        const folder = await this.prismaClient.folder.findFirst({
            where: {
                user_meeting_id: userMeetingId,
                parent_folder_id: null, // You can include other conditions as needed
            },
        });

        return folder !== null ? folder : null;
    }

    public async updateFolder(id: string, data: Prisma.FolderUpdateInput): Promise<Folder> {
        return this.prismaClient.folder.update({ where: { id }, data });
    }

    public async deleteFolder(id: string): Promise<Folder> {
        return this.prismaClient.folder.delete({ where: { id } });
    }

    public async createFolder(insertFolderDTO: InsertFolderDTO): Promise<Folder | string> {
        // Get variables
        const userMeetingId = insertFolderDTO.userMeetingId;
        let folderName = insertFolderDTO.folderName;
        const parent_folder = insertFolderDTO.parentFolderId;
        console.log(parent_folder)
        // Checking the permission to create folder of user
        const userMeeting = await this.userMeetingService.findUserMeetingById(userMeetingId);
        if (userMeeting === null) {
            throw new Error("User Meeting Id is not valid");
        }
        const meetingId = userMeeting.meetingId;
        
        // Checking root folder is existed or not
        const existFolder = await this.findFolderRootById(userMeetingId);
        if (existFolder !== null) {
            console.log(existFolder)
            throw new Error("Folder root is already exist")
        }

        // Using Meeting Name for Folder Name if folderName is null
        if (folderName?.length == 0 || folderName == null) {
            const meetingTitle  = (await this.meetingService.getMeeting( meetingId )).title;
            folderName = meetingTitle || "";
        }
        
        // Creating new folder
        const createFolder = await this.prismaClient.folder.create({
            data: {
                name: folderName,
                parent_folder_id: parent_folder,
                user_meeting_id: userMeetingId,
            },
        });
        
        return createFolder;
    }
}