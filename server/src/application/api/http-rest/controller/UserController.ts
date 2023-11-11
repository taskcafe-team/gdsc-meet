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
  Put,
  Res,
  StreamableFile,
  UnprocessableEntityException,
  UploadedFile,
  UseInterceptors,
} from "@nestjs/common";
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiTags } from "@nestjs/swagger";
import { HttpUserAuth } from "../auth/decorator/HttpUserAuth";
import { HttpUser } from "../auth/decorator/HttpUser";
import { HttpUserPayload } from "../auth/type/HttpAuthTypes";
import { GetUserAdapter } from "@infrastructure/adapter/usecase/user/GetUserAdapter";
import { CoreApiResponse } from "@core/common/api/CoreApiResponse";
import { UserUsecaseDTO } from "@core/domain/user/usecase/dto/UserUsecaseDTO";
import { UserService } from "@core/services/user/UserService";
import { HttpRestApiModelUpdateUser } from "./documentation/UserDocumentation";
// import { avatarStoragePath } from "src/data/path";
import { Response } from "express";
import LocalFilesInterceptor from "@core/common/interceptor/LocalFilesInterceptor ";
import { ConfigService } from "@nestjs/config";
import { EnvironmentVariablesConfig } from "@infrastructure/config/EnvironmentVariablesConfig";
import * as mime from "mime-types";
import { fileStoragePath } from "@infrastructure/adapter/persistence/data/path";

const MAX_PROFILE_PICTURE_SIZE_IN_BYTES = 2 * 1024 * 1024; // 2MB

@Controller("users")
@ApiTags("users")
export class UserController {
  private readonly endpointAvatarUrl: string;
  private readonly destination: string;

  constructor(
    private readonly userService: UserService,
    configService: ConfigService<EnvironmentVariablesConfig, true>,
  ) {
    this.endpointAvatarUrl = configService.get("FILE_STORAGE_AVATAR_ENDPOINT");
    this.destination = configService.get("FILE_STORAGE_BASE_PATH");
  }

  @Get("me")
  @HttpCode(HttpStatus.OK)
  @HttpUserAuth()
  @ApiBearerAuth()
  public async getMe(
    @HttpUser() httpUser: HttpUserPayload,
  ): Promise<CoreApiResponse<UserUsecaseDTO>> {
    const adapter: GetUserAdapter = await GetUserAdapter.new({
      userId: httpUser.id,
    });

    const result = await this.userService.getUser(adapter);
    return CoreApiResponse.success<UserUsecaseDTO>(result);
  }

  @Put("me")
  @HttpCode(HttpStatus.NO_CONTENT)
  @HttpUserAuth()
  @ApiBearerAuth()
  @ApiConsumes("multipart/form-data")
  @UseInterceptors(
    LocalFilesInterceptor({
      fieldName: "avatar",
      path: "/avatars",
      filename: (req, file, cb) => {
        const mimeType = mime.extension(file.mimetype);
        const fileName = `${Date.now()}.${mimeType}`;
        cb(null, fileName);
      },
      limits: { fieldSize: MAX_PROFILE_PICTURE_SIZE_IN_BYTES },
      fileFilter(req, file, callback) {
        if (!file.mimetype.match(/(png|jpe?g)$/)) {
          return callback(
            new UnprocessableEntityException("Only image files are allowed!"),
            false,
          );
        }
        callback(null, true);
      },
    }),
  )
  @ApiBody({ type: HttpRestApiModelUpdateUser })
  public async updateMe(
    @UploadedFile() file: Express.Multer.File | undefined,
    @Body() body: Omit<HttpRestApiModelUpdateUser, "avatar">,
  ) {
    const adapter = {
      firstName: body.firstName || undefined,
      lastName: body.lastName || undefined,
      avatar: file?.filename,
    };

    if (adapter.avatar)
      adapter.avatar = this.endpointAvatarUrl + adapter.avatar;

    await this.userService.updateMe(adapter);
  }

  @Get("avatar/:fileName")
  public async getAvatar(
    @Param("fileName") fileName: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    try {
      const filePath = path.join(fileStoragePath, "avatars", fileName);
      const stream = await createReadStream(filePath);
      res.set({
        "Content-Disposition": `inline; filename="${fileName}"`,
        "Content-Type": mime.lookup(filePath) || "text/plain",
      });
      return new StreamableFile(stream);
    } catch (error) {
      return null;
    }
  }
}
