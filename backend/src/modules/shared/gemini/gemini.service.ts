import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';

@Injectable()
export class GeminiService implements OnModuleInit {
  private genAI: GoogleGenerativeAI;

  constructor(private configService: ConfigService) {}

  onModuleInit() {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not configured.');
    }
    this.genAI = new GoogleGenerativeAI(apiKey);
  }

  async classifyFunnelStage(message: string): Promise<string> {
    const model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const prompt = `
      Analise a seguinte mensagem de vendas e classifique-a em um dos seguintes estágios do funil: "Lead", "Oportunidade", "Negociação", "Ganha", "Perdida".
      Responda APENAS com o nome do estágio.

      Exemplos:
      - "Olá, gostaria de saber mais sobre seus serviços." -> Lead
      - "Obrigado, recebi a proposta e parece interessante. Podemos agendar uma chamada para discutir os detalhes?" -> Oportunidade
      - "Podemos ajustar o preço do plano premium em 10%?" -> Negociação
      - "Perfeito, pode me enviar o contrato para assinatura." -> Ganha
      - "Agradeço, mas decidimos seguir com outra solução." -> Perdida

      Mensagem para classificar: "${message}"
    `;

    try {
      const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0 },
        safetySettings: [
          { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
          { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
          { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
          { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
        ],
      });
      const responseText = result.response.text().trim();
      const validStages = ["Lead", "Oportunidade", "Negociação", "Ganha", "Perdida"];
      return validStages.includes(responseText) ? responseText : 'Não Classificado';
    } catch (error) {
      console.error('Error classifying with Gemini:', error);
      throw new Error('Failed to classify message with AI');
    }
  }
}