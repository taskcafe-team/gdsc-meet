import { Body, Controller, Get, NotFoundException, Param, Post, StreamableFile, UploadedFile, UseInterceptors } from "@nestjs/common";
import { ApiBody, ApiTags } from "@nestjs/swagger";
import { File } from "@prisma/client";

import { createReadStream } from "fs";

import { FileInterceptor } from '@nestjs/platform-express';
import { InsertFileDTO } from "@core/domain/file/usecase/dto/FilerUseCaseDto";
import { FileService } from "@application/services/FileService";
import { CoreApiResponse } from "@core/common/api/CoreApiResponse";

@Controller("files")
@ApiTags("files")
export class FileController {
  constructor(private fileService: FileService) { }

  @Post("")
  @UseInterceptors(FileInterceptor('file'))
  public async createFile(@Body() insertFileDTO: InsertFileDTO, @UploadedFile() file): Promise<CoreApiResponse<File>> {
    //console.log(insertFileDTO.userId)
    const file1 = await this.fileService.createFile(insertFileDTO.folderId, file);
    return CoreApiResponse.success(file1);
  }

  // This end-point for getting the content of one Doc by File ID. 
  // Example for testing with postman: http://localhost:8080/files/516e71c5-bb6c-4f53-80cc-a886684611dd
  // 516e71c5-bb6c-4f53-80cc-a886684611dd is File Id
  @Get("/:fileId")
  public async getFile(@Param('fileId') fileId: string): Promise<StreamableFile> {
    const fileContent = await this.fileService.getFileContentById(fileId);
    if (!fileContent) {
      throw new NotFoundException('File not found');
    }
    const file = createReadStream(fileContent);
    return new StreamableFile(file);
  }

  // This end-point for getting all File in a Folder by Folder Id
  // Example for testing with postman: http://localhost:8080/files/a6737c75-7962-4de7-bf74-dc7dc8bc77d7
  // a6737c75-7962-4de7-bf74-dc7dc8bc77d7 is Folder Id
  @Get('a/:folderId')
  public async getFiles(@Param('folderId') folderId: string): Promise<CoreApiResponse<File[]>> {
    console.log(folderId)
    const files = await this.fileService.getAllFilesByFolderId(folderId);
    //console.log(files);
    return CoreApiResponse.success(files);
  }
}