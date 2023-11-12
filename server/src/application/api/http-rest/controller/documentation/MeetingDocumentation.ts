import { ApiProperty } from "@nestjs/swagger";

import { MeetingType } from "@core/common/enums/MeetingEnums";
import { IsDate, IsEnum, IsOptional, IsString } from "class-validator";
import { Transform, TransformFnParams } from "class-transformer";

export class HttpRestApiModelCreateMeetingBody {
  @IsString()
  @IsOptional()
  @ApiProperty({ type: "string", nullable: true, default: null })
  public title: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ type: "string", nullable: true, default: null })
  public description: string;

  @IsDate()
  @IsOptional()
  @ApiProperty({ type: Date, nullable: true, default: null })
  public startDate: Date;

  @IsDate()
  @IsOptional()
  @ApiProperty({ type: Date, nullable: true, default: null })
  public endDate: Date;

  @ApiProperty({
    enum: MeetingType,
    nullable: true,
    default: MeetingType.PUBLIC,
  })
  @IsEnum(MeetingType)
  public type: MeetingType;
}

export class HttpRestApiModelDeleteMeetingsBody {
  @Transform((params: TransformFnParams) => {
    return { ids: params.value.split(",") };
  })
  public ids: string[];
}
