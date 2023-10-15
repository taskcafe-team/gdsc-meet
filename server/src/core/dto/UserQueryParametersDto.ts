import {
  IsNumber,
  Min,
  IsOptional,
  IsString,
  IsBoolean,
} from "class-validator";
import { Transform, Type } from "class-transformer";

export class UserQueryParametersDto {
  @IsOptional()
  @Transform(({ value }) => String(value))
  @IsString()
  id?: string;

  @IsOptional()
  @Transform(({ value }) => (value === "default" ? undefined : value))
  @IsString()
  email?: string;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  isValid?: boolean;

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  offset: number;

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  limit: number;
}
