import { GenerateTextDto } from "@core/domain/semini/GeminiUseCaseDto";
import { ApiBody, ApiResponse } from "@nestjs/swagger";

export function ApiGenerateText() {
    return function (
      target: any,
      propertyKey: string,
      descriptor: PropertyDescriptor,
    ) {
      ApiBody({ type: GenerateTextDto })(target, propertyKey, descriptor);
      ApiResponse({ status: 200, description: 'Returns the generated text' })(
        target,
        propertyKey,
        descriptor,
      );
      ApiResponse({ status: 404, description: 'Not Found' })(
        target,
        propertyKey,
        descriptor,
      );
      ApiResponse({ status: 500, description: 'Internal Server Error' })(
        target,
        propertyKey,
        descriptor,
      );
    };
  }