import { FileValidator } from "@nestjs/common";

export interface CustomUploadTypeValidatorOptions {
  fileType: string[];
}

export class CustomUploadFileValidator extends FileValidator {
  private _allowedMimeTypes: string[];

  constructor(
    protected readonly validationOptions: CustomUploadTypeValidatorOptions,
  ) {
    super(validationOptions);
    this._allowedMimeTypes = this.validationOptions.fileType;
  }

  public isValid(file?: any): boolean {
    return true;
  }

  public buildErrorMessage(): string {
    const types = this._allowedMimeTypes.join(", ");
    return `Upload not allowed. Upload only files of type: ${types}`;
  }
}
