import { UseCaseValidatableAdapter } from "@core/common/adapter/usecase/UseCaseValidatableAdapter";
import { Exclude } from "class-transformer";

@Exclude()
export class CreateRoomLivekitAdapter extends UseCaseValidatableAdapter {}
