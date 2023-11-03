import * as path from "path";
import { createReadStream, createWriteStream, existsSync, mkdirSync } from "fs";
import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseFilePipeBuilder,
  Post,
  Put,
  Res,
  StreamableFile,
  UploadedFile,
  UseInterceptors,
} from "@nestjs/common";
import { Multer } from "multer";
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiTags } from "@nestjs/swagger";
import { HttpAuth } from "../auth/decorator/HttpAuth";
import { HttpUser } from "../auth/decorator/HttpUser";
import { HttpUserPayload } from "../auth/type/HttpAuthTypes";
import { GetUserAdapter } from "@infrastructure/adapter/usecase/user/GetUserAdapter";
import { CoreApiResponse } from "@core/common/api/CoreApiResponse";
import { UserUsecaseDto } from "@core/domain/user/usecase/dto/UserUsecaseDto";
import { UserService } from "@core/services/user/UserService";
import { FileInterceptor } from "@nestjs/platform-express";
import {
  HttpRestApiModelGetAvatar,
  HttpRestApiModelUpdateUser,
} from "./documentation/UserDocumentation";
// import { avatarStoragePath } from "src/data/path";
import { Response } from "express";

const MAX_PROFILE_PICTURE_SIZE_IN_BYTES = 2 * 1024 * 1024; // 2MB
const avatarStoragePath = `D:/data/avatar`;

@Controller("users")
@ApiTags("users")
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get("me")
  @HttpCode(HttpStatus.OK)
  @HttpAuth()
  @ApiBearerAuth()
  public async getMe(
    @HttpUser() httpUser: HttpUserPayload,
  ): Promise<CoreApiResponse<UserUsecaseDto>> {
    const adapter: GetUserAdapter = await GetUserAdapter.new({
      userId: httpUser.id,
    });

    const result = await this.userService.getUser(adapter);
    return CoreApiResponse.success<UserUsecaseDto>(result);
  }

  @Put("me")
  @ApiConsumes("multipart/form-data")
  @UseInterceptors(FileInterceptor("avatar"))
  @ApiBody({ type: HttpRestApiModelUpdateUser })
  // @HttpCode(HttpStatus.NO_CONTENT)
  @HttpAuth()
  @ApiBearerAuth()
  public async updateMe(
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({ fileType: "image/jpeg" })
        .addMaxSizeValidator({ maxSize: MAX_PROFILE_PICTURE_SIZE_IN_BYTES })
        .build({ errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY }),
    )
    file: Express.Multer.File | undefined,
    @Body() body: Omit<HttpRestApiModelUpdateUser, "avatar">,
  ) {
    const adapter = {
      firstName: body.firstName,
      lastName: body.lastName,
    };
    if (file) {
      const avatarFile = file;
      if (!existsSync(avatarStoragePath))
        throw new Error("Avatar storage path not found");
      const uniqueFileName = `${Date.now()}.${file.mimetype}`;
      const uploadPath = path.join(avatarStoragePath, uniqueFileName);
      const writeStream = createWriteStream(uploadPath);
      await writeStream.write(avatarFile.buffer);
      await writeStream.end();
      adapter["avatar"] = avatarFile.originalname;
    }

    return await this.userService.updateMe(adapter);
  }

  @Get("avatar/:fileName")
  public async getAvatar(
    @Param("fileName") fileName: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    try {
      const filePath = path.join(avatarStoragePath, fileName);
      const stream = await createReadStream(filePath);
      res.set({
        "Content-Disposition": `inline; filename="${fileName}"`,
        "Content-Type": "image/jpeg",
      });
      return new StreamableFile(stream);
    } catch (error) {
      console.log(error);
    }
  }
}
