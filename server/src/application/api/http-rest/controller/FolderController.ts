import { FolderService } from "@application/services/FolderService";
import { CoreApiResponse } from "@core/common/api/CoreApiResponse";
import { InsertFolderDTO } from "@core/domain/folder/usecase/dto/FolderUseCaseDto";

import { Body, Controller, Delete, Get, Param, Post, Put, Res, StreamableFile } from "@nestjs/common";
import { ApiBody, ApiTags } from "@nestjs/swagger";
import { Folder, UserFolder } from "@prisma/client";
import { createReadStream } from 'fs';
import { join } from 'path';

@Controller("folders")
@ApiTags("folders")
export class FolderController {
  constructor(private folderService: FolderService) { }

  @Get("")
  public async findAllFolder(@Param("userId") userId: string): Promise<CoreApiResponse<Folder[] | null>> {
    const result = await this.folderService.getAllFolderByUserId(userId);
    return CoreApiResponse.success(result);
  }

  @ApiBody({ type: InsertFolderDTO })
  @Post("")
  public async createFolder(@Body() insertFolderDTO: InsertFolderDTO): Promise<CoreApiResponse<Folder | string>> {
    const result = await this.folderService.createFolder(insertFolderDTO)
    return CoreApiResponse.success(result);
  }

  @Get("/getFolderId")
  public async getFolderIdByMeetingId(@Param("meetingId") meetingId: string): Promise<CoreApiResponse<string>> {
    const result = await this.folderService.getFolderIdByMeetingId(meetingId)
    return CoreApiResponse.success(result);
  }

  // @Put(':id')
  // public async updateFolder(@Param('id') id: string, @Body() folderData: Folder): Promise<Folder> {
  //   return this.folderService.updateFolder(id, folderData);
  // }

  // @Delete(':id')
  // public async deleteFolder(@Param('id') id: string): Promise<Folder> {
  //   return this.folderService.deleteFolder(id);
  // }

  // @Get(':id')
  // public async findFolderById(@Param('folderId') folderId: string): Promise<Folder> {
  //   return this.folderService.findById(id);
  // }
}