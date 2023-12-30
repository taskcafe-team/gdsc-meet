import { IsNotEmpty } from "class-validator";
import { BaseConfig } from "./BaseConfig";
import { env } from "process";

export class GeminiConfig extends BaseConfig {
    @IsNotEmpty() GEMINI_PRO_MODEL_NAME = env.GEMINI_PRO_MODEL_NAME ?? "";
    @IsNotEmpty() GOOGLE_API_KEY = env.GOOGLE_API_KEY ?? "";

  }