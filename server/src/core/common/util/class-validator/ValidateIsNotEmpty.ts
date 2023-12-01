import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from "class-validator";

export function ValidateIsNotEmpty(
  property: string,
  validationOptions?: ValidationOptions,
) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: "ValidateIsNotEmpty",
      target: object.constructor,
      propertyName: propertyName,
      constraints: [property],
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          const [relatedPropertyName] = args.constraints;
          const relatedValue = (args.object as any)[relatedPropertyName];
          return typeof value === "string" && value.length > 0; // you can add more conditions here
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} should not be empty`;
        },
      },
    });
  };
}
