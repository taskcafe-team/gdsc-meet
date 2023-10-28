import { Injectable } from "@nestjs/common";
import { UserUsecase } from "@core/domain/user/usecase/UserUsecase";
import { UserUsecaseDto } from "@core/domain/user/usecase/dto/UserUsecaseDto";

import { GetUserPort } from "../../domain/user/port/GetUserPort";
import { CreateUserPort } from "../../domain/user/port/CreateUserPort";

import { UnitOfWork } from "@core/common/persistence/UnitOfWork";
import { Exception } from "@core/common/exception/Exception";
import { Code } from "@core/common/code/Code";
import { FirebaseService } from "../firebase/FirebaseService";

@Injectable()
export class UserService implements UserUsecase {
  constructor(private readonly unitOfWork: UnitOfWork,
    private readonly firebaseService: FirebaseService) {}

  public async getUser(payload: GetUserPort): Promise<UserUsecaseDto> {
    const user = await this.unitOfWork
      .getUserRepository()
      .findUser({ id: payload.userId });

    if (!user) throw Exception.new({ code: Code.NOT_FOUND_ERROR });
    return UserUsecaseDto.newFromEntity(user);
  }

  public async createUser(payload: CreateUserPort): Promise<UserUsecaseDto> {
    throw new Error("Not implemented");
  }
  
  public async updateUserAvatar(userId: string, file: Express.Multer.File): Promise<string> {
    console.log("âsdasdasds")
    const filePath = await this.firebaseService.uploadUserAvatar(userId, file);
    console.log(filePath)
    // Thực hiện cập nhật đường dẫn avatar trong cơ sở dữ liệu 
    const user = await this.unitOfWork.getUserRepository().findUser({ id: userId });
    if (!user) throw Exception.new({ code: Code.NOT_FOUND_ERROR });
    if (user.avatar != null) {
      user.avatar = filePath;
      await this.unitOfWork.getUserRepository().updateUser(user);
    }
  
    return filePath;
  }
}
