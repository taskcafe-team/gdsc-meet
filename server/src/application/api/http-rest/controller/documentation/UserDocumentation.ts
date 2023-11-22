import { ApiProperty } from "@nestjs/swagger";
import { Express } from "express";

export class HttpRestApiModelUpdateUser {
  @ApiProperty({ type: "string", required: false }) public firstName?: string;
  @ApiProperty({ type: "string", required: false }) public lastName?: string;
  @ApiProperty({ type: "string", format: "binary", required: false })
  public avatar?: Express.Multer.File;
}
