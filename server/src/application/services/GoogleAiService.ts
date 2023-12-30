import { Injectable } from '@nestjs/common';
import { TextServiceClient } from '@google-ai/generativelanguage';
import { GoogleAuth } from 'google-auth-library';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { ConfigService } from '@nestjs/config';
import { GeminiConfig } from '@infrastructure/config/GeminiConfig';



@Injectable()
export class GoogleAiService {
  private textServiceClient: TextServiceClient;
  private generativeAI: GoogleGenerativeAI;

  constructor(
    configService: ConfigService<GeminiConfig>,
  ) {
    const GEMINI_PRO_MODEL_NAME = configService.get('GEMINI_PRO_MODEL_NAME');
    const GOOGLE_API_KEY = configService.get('GOOGLE_API_KEY');
    
    this.textServiceClient = new TextServiceClient({
      authClient: new GoogleAuth().fromAPIKey(GEMINI_PRO_MODEL_NAME),
    });
    this.generativeAI = new GoogleGenerativeAI(GOOGLE_API_KEY);
  }

  async generateGeminiPro(prompt: string): Promise<string> {
    const geminiProModel = this.generativeAI.getGenerativeModel({
      model: 'gemini-pro',
    });
    const result = await geminiProModel.generateContent(prompt);
    const response = await result.response;
    return response.text();
  }

  async generateText(prompt: string): Promise<string> {
    try {
      // Provide a default value if the environment variable is not set
      const modelName = process.env.GEMINI_PRO_MODEL_NAME || 'models/text-bison-001';
  
      const result = await this.textServiceClient.generateText({
        model: modelName,
        prompt: {
          text: prompt,
        },
      });
  
      if (!result || !result[0]?.candidates || result[0].candidates.length === 0) {
        throw new Error('No text was generated');
      }
  
      const generatedText = result[0].candidates[0].output;
  
      // Ensure that generatedText is not null or undefined
      if (typeof generatedText !== 'string') {
        throw new Error('Generated text is not a string');
      }
  
      return generatedText;
    } catch (error) {
      console.error('Error generating text:', error);
      throw error;
    }
  }
  
  
}
