import { IsNotEmpty } from "class-validator";
import { BaseConfig } from "./BaseConfig";

export class FileStorageConfig extends BaseConfig {
  @IsNotEmpty() FILE_STORAGE_BASE_PATH = "demo"; // vị tri lưu file trên local
  @IsNotEmpty() FILE_STORAGE_ENDPOINT = "demo"; // đường dẫn truy cập file qua https?
  @IsNotEmpty() FILE_STORAGE_AVATAR_ENDPOINT = "demoF"; // đường dẫn truy cập avatar qua https?

  // public static readonly ENDPOINT = "";
  // public static readonly PORT = "";
  // public static readonly ACCESS_KEY = "";
  // public static readonly SECRET_KEY = "";
  // public static readonly USE_SSL = "";
  // public static readonly BASE_PATH = "";
  // public static readonly IMAGE_BUCKET = "";
  // public static readonly IMAGE_EXT = "";
  // public static readonly IMAGE_MIMETYPE = "";
}
