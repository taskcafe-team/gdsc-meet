import { Module, Provider } from "@nestjs/common";

import { UserService } from "@core/services/user/UserService";
import { UserDITokens } from "@core/domain/user/di/UserDITokens";

import { InfrastructureModule } from "./InfrastructureModule";

const persistenceProviders: Provider[] = [
  {
    provide: UserDITokens.UserUsecase,
    useClass: UserService,
  },
];

@Module({
  imports: [InfrastructureModule],
  controllers: [],
  providers: [...persistenceProviders],
  exports: [UserDITokens.UserUsecase],
})
export class UserModule {}
