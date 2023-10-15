import { GetUserPort } from "./../../../../core/domain/user/port/GetUserPort";
import * as path from "path";
import { createWriteStream } from "fs";
import { Multer } from "multer";
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Put,
  Query,
  UploadedFile,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiTags,
} from "@nestjs/swagger";
import { HttpAuth } from "../auth/decorator/HttpAuth";
import { HttpUser } from "../auth/decorator/HttpUser";
import { HttpUserPayload } from "../auth/type/HttpAuthTypes";
import { GetUserAdapter } from "@infrastructure/adapter/usecase/user/GetUserAdapter";
import { CoreApiResponse } from "@core/common/api/CoreApiResponse";
import { UserUsecaseDto } from "@core/domain/user/usecase/dto/UserUsecaseDto";
import { UserService } from "@core/services/user/UserService";
import { FileInterceptor } from "@nestjs/platform-express";
import { HttpRestApiModelUpdateUser } from "./documentation/UserDocumentation";
import { User } from "@core/domain/user/entity/User";
import { UserQueryParametersDto } from "@core/dto/UserQueryParametersDto";

@Controller("users")
@ApiTags("users")
@UsePipes(new ValidationPipe({ transform: true }))
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get("me")
  @HttpCode(HttpStatus.OK)
  @HttpAuth() //truyền vào đây những những ai có quyền sử dụng hàm này, ở đây nếu không có gì có nghĩa là mọi role đều có thể sử dụng.
  @ApiBearerAuth()
  public async getMe(
    @HttpUser() httpUser: HttpUserPayload,
  ): Promise<CoreApiResponse<UserUsecaseDto>> {
    const adapter: GetUserAdapter = await GetUserAdapter.new({
      userId: httpUser.id,
    });

    const result = await this.userService.getUser(adapter);
    return CoreApiResponse.success(result);
  }

  @Put("me")
  @ApiConsumes("multipart/form-data")
  @ApiOperation({ summary: "hello" })
  @UseInterceptors(FileInterceptor("avatar"))
  @ApiBody({ type: HttpRestApiModelUpdateUser })
  public async updateMe(@Body() body: HttpRestApiModelUpdateUser) {
    const avatarFile = body.avatar;

    const uniqueFileName = `${Date.now()}-${avatarFile.originalname}`;
    const uploadPath = path.join(
      __dirname,
      "./../../../../../",
      "data",
      uniqueFileName,
    );
    const writeStream = createWriteStream(uploadPath);
    writeStream.write(avatarFile.buffer);
    writeStream.end();
    return;
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  public async getUsers(@Query() queryParameters: UserQueryParametersDto) {
    const { id, email, offset, limit, isValid } = queryParameters;
    let users;

    // Xây dựng truy vấn dựa trên các tham số truy vấn
    const query = this.userService.buildUsersQuery({
      id,
      email,
      isValid,
      offset,
      limit,
    });

    // Thực hiện truy vấn dựa trên query
    users = await query;

    // Trả về kết quả
    return CoreApiResponse.success(users);
  }

  @Delete("/:id")
  @HttpCode(HttpStatus.OK)
  //@HttpAuth()
  //@ApiBearerAuth()
  public async deleteUserById(
    @Param("id") id: string,
  ): Promise<CoreApiResponse<void>> {
    const user = await this.userService.deleteUser({ userId: id });
    console.log(JSON.stringify(user));
    return CoreApiResponse.success(user);
  }

  // @Get()
  // @HttpCode(HttpStatus.OK)
  // //@HttpAuth()
  // //@ApiBearerAuth()
  // public async getUserByEmail(
  //   @Query("email") email: string,
  //   @Query() { offset, limit }: UsersPaginationParamsDto,
  // ): Promise<CoreApiResponse<UserUsecaseDto>> {
  //   const user = await this.userService.getUserByEmail(
  //     { userEmail: email },
  //     offset,
  //     limit,
  //   );

  //   return CoreApiResponse.success(user);
  // }
}
