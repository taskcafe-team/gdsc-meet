import * as path from "path";
import { FileInterceptor } from "@nestjs/platform-express";
import { Injectable, mixin, NestInterceptor, Type } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { MulterOptions } from "@nestjs/platform-express/multer/interfaces/multer-options.interface";
import { diskStorage, DiskStorageOptions } from "multer";
import { EnvironmentVariablesConfig } from "@infrastructure/config/EnvironmentVariablesConfig";
import { fileStoragePath } from "@infrastructure/adapter/persistence/data/path";

interface LocalFilesInterceptorOptions {
  fieldName: string;
  path?: string;
  fileFilter?: MulterOptions["fileFilter"];
  limits?: MulterOptions["limits"];
  filename?: DiskStorageOptions["filename"];
}

function LocalFilesInterceptor(
  options: LocalFilesInterceptorOptions,
): Type<NestInterceptor> {
  @Injectable()
  class Interceptor implements NestInterceptor {
    fileInterceptor: NestInterceptor;
    constructor(
      private configService: ConfigService<EnvironmentVariablesConfig, true>,
    ) {
      const destination = path.join(fileStoragePath, options.path || "");
      const filename = options.filename;
      const multerOptions: MulterOptions = {
        storage: diskStorage({ destination, filename }),
        fileFilter: options.fileFilter,
        limits: options.limits,
      };

      const fileIc = FileInterceptor(options.fieldName, multerOptions);
      this.fileInterceptor = new fileIc();
    }

    intercept(...args: Parameters<NestInterceptor["intercept"]>) {
      return this.fileInterceptor.intercept(...args);
    }
  }
  return mixin(Interceptor);
}

export default LocalFilesInterceptor;
