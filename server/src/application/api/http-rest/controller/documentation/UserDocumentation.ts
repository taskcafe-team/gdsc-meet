import { ApiProperty } from "@nestjs/swagger";

export class HttpRestApiModelUpdateUser {
  @ApiProperty({ type: "string", nullable: true }) public firstName: string;
  @ApiProperty({ type: "string", nullable: true }) public lastName: string;
  @ApiProperty({ type: "file", format: "binary" })
  public avatar: Express.Multer.File;
}
