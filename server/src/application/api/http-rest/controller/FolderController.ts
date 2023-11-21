import { CoreApiResponse } from "@core/common/api/CoreApiResponse";
import { InsertFolderDTO } from "@core/domain/folder/usecase/dto/FolderUseCaseDto";
import { FileService } from "@core/services/file/FileService";
import { FolderService } from "@core/services/folder/FolderService";
import { Body, Controller, Delete, Get, Param, Post, Put, Res, StreamableFile } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { Folder, UserFolder } from "@prisma/client";
import { createReadStream } from 'fs';
import { join } from 'path';

@Controller("folders")
@ApiTags("folders")
export class FolderController {
  constructor(private folderService: FolderService) { }

  @Get("")
  public async findAllFolder(@Param("userId") userId: string,): Promise<Folder[]> {
    return this.folderService.getAllFolderByUserId(userId);
  }

    // @Get(':id')
    // public async findFolderById(@Param('folderId') folderId: string): Promise<Folder> {
    //   return this.folderService.findById(id);
    // }

  @Post("")
  public async createFolder(@Body()insertFolderDTO: InsertFolderDTO): Promise<Folder | string> {
    const result = await this.folderService.createFolder(insertFolderDTO)
    return result;
  }

  // @Put(':id')
  // public async updateFolder(@Param('id') id: string, @Body() folderData: Folder): Promise<Folder> {
  //   return this.folderService.updateFolder(id, folderData);
  // }

  // @Delete(':id')
  // public async deleteFolder(@Param('id') id: string): Promise<Folder> {
  //   return this.folderService.deleteFolder(id);
  // }

  
}