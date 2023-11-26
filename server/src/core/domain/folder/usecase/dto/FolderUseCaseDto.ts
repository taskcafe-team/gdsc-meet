import { ApiProperty } from "@nestjs/swagger"
import { IsNotEmpty, IsOptional, IsString } from "class-validator"

export class InsertFolderDTO {

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    userMeetingId: string
    
    @ApiProperty()
    @IsString()
    @IsOptional()
    folderName? : string

    @ApiProperty()
    @IsString()
    @IsOptional()
    parentFolderId? : string
}