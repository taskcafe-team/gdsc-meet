import { ApiProperty } from "@nestjs/swagger"
import { IsNotEmpty, IsOptional, IsString } from "class-validator"

export class InsertFileDTO {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    folderId: string
 
}