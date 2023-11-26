
import { AppErrors } from "@core/common/exception/AppErrors";
import { AppException } from "@core/common/exception/AppException";
import { Injectable } from "@nestjs/common";
import { PrismaClient, UserFolder } from "@prisma/client";

@Injectable()
export class UserFolderService {
    constructor(private readonly prismaClient: PrismaClient) { }
    public async createUserFolder(userId: string, folderId: string): Promise<UserFolder> {

        // Check if the userFolder is exist or not
        const userFolderExist = await this.findUserFolderById(userId,folderId);
        // If userFolder is existed, 
        if (userFolderExist){
            throw new AppException(AppErrors.ENTITY_ALREADY_EXISTED_ERROR);

        }  
        const createdUserFolder = await this.prismaClient.userFolder.create({
            data: {
                userId,
                folderId,
            },
        });

        return createdUserFolder;
    }

    public async findUserFolderById(userId: string, folderId: string): Promise<UserFolder | null> {
        const result = await this.prismaClient.userFolder.findMany({
            where: {
                 userId: userId, 
                 folderId: folderId
            },
            take: 1,
        });
    
        return result !== null ? result[0] : null;;
    }
}