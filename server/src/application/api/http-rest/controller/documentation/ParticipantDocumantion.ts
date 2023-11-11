import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsArray, IsOptional, IsString, ValidateNested } from "class-validator";

export class HttpRestApiModelSendMessage {
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => String)
  @ApiProperty({ type: "array", items: { type: "string" } })
  sendto?: string[];

  @IsString()
  @ApiProperty({ type: "string" })
  message: string;
}
