import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class GenerateTextDto {
    @ApiProperty({ example: 'Your prompt text here' })
    @IsString()
    prompt: string;
  }