import * as path from "path";
import { createReadStream } from "fs";
import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Param,
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
import { CoreApiResponse } from "@core/common/api/CoreApiResponse";
import { UserUsecaseDTO } from "@core/domain/user/usecase/dto/UserUsecaseDTO";
import { HttpRestApiModelUpdateUser } from "./documentation/UserDocumentation";
import { Response } from "express";
import LocalFilesInterceptor from "@core/common/interceptor/LocalFilesInterceptor ";
import { ConfigService } from "@nestjs/config";
import { EnvironmentVariablesConfig } from "@infrastructure/config/EnvironmentVariablesConfig";
import { fileStoragePath } from "@infrastructure/adapter/persistence/data/path";
import { UserUsecase } from "@core/domain/user/usecase/UserUsecase";
import * as mime from "mime-types";
import { UserService } from "@application/services/UserService";

const MAX_PROFILE_PICTURE_SIZE_IN_BYTES = 2 * 1024 * 1024; // 2MB

@Controller("users")
@ApiTags("users")
export class UserController {
  private readonly endpointAvatarUrl: string;
  private readonly destination: string;

  constructor(
    @Inject(UserService)
    private readonly userService: UserUsecase,
    configService: ConfigService<EnvironmentVariablesConfig, true>,
  ) {
    this.endpointAvatarUrl = configService.get("FILE_STORAGE_AVATAR_ENDPOINT");
    this.destination = configService.get("FILE_STORAGE_BASE_PATH");
  }

  @ApiBearerAuth()
  @Get("me")
  @HttpUserAuth()
  public async getMe(
    @HttpUser() httpUser: HttpUserPayload,
  ): Promise<CoreApiResponse<UserUsecaseDTO>> {
    const result = await this.userService.getUserById(httpUser.id);
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
    @HttpUser() httpUser: HttpUserPayload,
  ) {
    const { firstName, lastName } = body;
    const adapter = { firstName, lastName, avatar: file?.filename };

    if (adapter.avatar)
      adapter.avatar = this.endpointAvatarUrl + adapter.avatar;

    await this.userService.updateProfile(httpUser.id, adapter);
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
