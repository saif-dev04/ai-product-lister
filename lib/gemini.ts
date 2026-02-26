import { GoogleGenerativeAI, ChatSession } from '@google/generative-ai';

export type ImageEditResult = {
  text?: string;
  imageBase64?: string;
  error?: string;
};

export type ListingData = {
  titles: string[];
  description: {
    overview: string;
    features: string[];
    materials: string;
    care: string;
  };
  tags: string[];
  category: string;
  priceRange: { low: number; high: number };
  targetAudience: string;
};

let genAI: GoogleGenerativeAI | null = null;
let chatSession: ChatSession | null = null;
let currentModelName: string = '';

// Model names for image generation
const QUALITY_MODEL = 'gemini-2.5-flash-image'; // Quality model for image generation
const FAST_MODEL = 'gemini-2.5-flash-image'; // Fast model

export function initGemini(apiKey: string) {
  genAI = new GoogleGenerativeAI(apiKey);
  chatSession = null;
}

export function getImageModel(preferQuality: boolean, forceFallback: boolean = false) {
  if (!genAI) throw new Error('Gemini not initialized. Please set API key in Settings.');

  // Use fallback model if forced or if quality model keeps failing
  let modelName: string;
  if (forceFallback) {
    modelName = FAST_MODEL;
  } else {
    modelName = preferQuality ? QUALITY_MODEL : FAST_MODEL;
  }

  currentModelName = modelName;

  return genAI.getGenerativeModel({
    model: modelName,
    generationConfig: {
      responseModalities: ['TEXT', 'IMAGE'],
    } as any,
  });
}

// Check if error is retryable (503, 429, etc.)
function isRetryableError(error: any): boolean {
  const message = error?.message || '';
  return message.includes('503') ||
         message.includes('429') ||
         message.includes('high demand') ||
         message.includes('overloaded') ||
         message.includes('temporarily unavailable');
}

export function getTextModel() {
  if (!genAI) throw new Error('Gemini not initialized. Please set API key in Settings.');

  return genAI.getGenerativeModel({
    model: 'gemini-2.5-flash',
  });
}

export async function startImageChat(
  apiKey: string,
  preferQuality: boolean,
  imageBase64: string,
  initialPrompt: string
): Promise<ImageEditResult> {
  initGemini(apiKey);

  // Try with preferred model first
  let model = getImageModel(preferQuality, false);
  let chat = model.startChat();
  chatSession = chat;

  try {
    const result = await chat.sendMessage([
      { inlineData: { mimeType: 'image/jpeg', data: imageBase64 } },
      { text: initialPrompt },
    ]);

    return parseImageResponse(result);
  } catch (error: any) {
    // If retryable error and we were using quality model, try fallback
    if (isRetryableError(error) && preferQuality) {
      console.log('Primary model unavailable, trying fallback model...');
      try {
        model = getImageModel(false, true);
        chat = model.startChat();
        chatSession = chat;

        const result = await chat.sendMessage([
          { inlineData: { mimeType: 'image/jpeg', data: imageBase64 } },
          { text: initialPrompt },
        ]);

        const response = parseImageResponse(result);
        response.text = (response.text || '') + '\n(Used fallback model due to high demand)';
        return response;
      } catch (fallbackError: any) {
        return { error: fallbackError.message || 'Failed to process image' };
      }
    }
    return { error: error.message || 'Failed to process image' };
  }
}

export async function continueImageChat(prompt: string): Promise<ImageEditResult> {
  if (!chatSession) {
    return { error: 'No active chat session. Please start a new edit.' };
  }

  try {
    const result = await chatSession.sendMessage([{ text: prompt }]);
    return parseImageResponse(result);
  } catch (error: any) {
    return { error: error.message || 'Failed to process request' };
  }
}

export async function editImageSingleTurn(
  apiKey: string,
  preferQuality: boolean,
  imageBase64: string,
  prompt: string
): Promise<ImageEditResult> {
  initGemini(apiKey);

  // Try with preferred model first
  let model = getImageModel(preferQuality, false);

  try {
    const result = await model.generateContent([
      { inlineData: { mimeType: 'image/jpeg', data: imageBase64 } },
      { text: prompt },
    ]);

    return parseImageResponse(result);
  } catch (error: any) {
    // If retryable error and we were using quality model, try fallback
    if (isRetryableError(error) && preferQuality) {
      console.log('Primary model unavailable, trying fallback model...');
      try {
        model = getImageModel(false, true);

        const result = await model.generateContent([
          { inlineData: { mimeType: 'image/jpeg', data: imageBase64 } },
          { text: prompt },
        ]);

        const response = parseImageResponse(result);
        response.text = (response.text || '') + '\n(Used fallback model due to high demand)';
        return response;
      } catch (fallbackError: any) {
        return { error: fallbackError.message || 'Failed to edit image' };
      }
    }
    return { error: error.message || 'Failed to edit image' };
  }
}

export async function generateImageVariations(
  apiKey: string,
  preferQuality: boolean,
  imageBase64: string
): Promise<ImageEditResult[]> {
  initGemini(apiKey);

  const prompts = [
    'Show this product with warm studio lighting on a pure white background. Keep the product exactly as it is.',
    'Show this product with cool minimal lighting and a slight shadow on a light gray background. Keep the product exactly as it is.',
    'Show this product in a lifestyle setting, as if it were being worn or used naturally. Keep the product exactly as it is.',
    'Show this product in a flat-lay arrangement on a dark wood surface with subtle props. Keep the product exactly as it is.',
  ];

  const results = await Promise.all(
    prompts.map(async (prompt) => {
      // Try with preferred model first
      let model = getImageModel(preferQuality, false);

      try {
        const result = await model.generateContent([
          { inlineData: { mimeType: 'image/jpeg', data: imageBase64 } },
          { text: prompt },
        ]);
        return parseImageResponse(result);
      } catch (error: any) {
        // If retryable error and we were using quality model, try fallback
        if (isRetryableError(error) && preferQuality) {
          try {
            model = getImageModel(false, true);
            const result = await model.generateContent([
              { inlineData: { mimeType: 'image/jpeg', data: imageBase64 } },
              { text: prompt },
            ]);
            return parseImageResponse(result);
          } catch (fallbackError: any) {
            return { error: fallbackError.message || 'Failed to generate variation' };
          }
        }
        return { error: error.message || 'Failed to generate variation' };
      }
    })
  );

  return results;
}

export async function removeBackground(
  apiKey: string,
  preferQuality: boolean,
  imageBase64: string
): Promise<ImageEditResult> {
  return editImageSingleTurn(
    apiKey,
    preferQuality,
    imageBase64,
    'Remove the background completely and replace it with a pure white background. Keep the product/subject exactly as it is with clean edges.'
  );
}

export async function generateFromText(
  apiKey: string,
  preferQuality: boolean,
  prompt: string
): Promise<ImageEditResult> {
  initGemini(apiKey);

  // Try with preferred model first
  let model = getImageModel(preferQuality, false);

  try {
    const result = await model.generateContent([
      { text: `Generate a professional product photo: ${prompt}. Make it look like a high-quality e-commerce product image with clean lighting and background.` },
    ]);

    return parseImageResponse(result);
  } catch (error: any) {
    // If retryable error and we were using quality model, try fallback
    if (isRetryableError(error) && preferQuality) {
      console.log('Primary model unavailable, trying fallback model...');
      try {
        model = getImageModel(false, true);

        const result = await model.generateContent([
          { text: `Generate a professional product photo: ${prompt}. Make it look like a high-quality e-commerce product image with clean lighting and background.` },
        ]);

        const response = parseImageResponse(result);
        response.text = (response.text || '') + '\n(Used fallback model due to high demand)';
        return response;
      } catch (fallbackError: any) {
        return { error: fallbackError.message || 'Failed to generate image' };
      }
    }
    return { error: error.message || 'Failed to generate image' };
  }
}

export async function generateListing(
  apiKey: string,
  imageBase64: string,
  brandName?: string,
  tone?: string
): Promise<ListingData | { error: string }> {
  initGemini(apiKey);
  const model = getTextModel();

  const brandContext = brandName ? `Brand name: ${brandName}. ` : '';
  const toneContext = tone ? `Use a ${tone} tone. ` : '';

  try {
    const result = await model.generateContent([
      { inlineData: { mimeType: 'image/jpeg', data: imageBase64 } },
      {
        text: `${brandContext}${toneContext}Analyze this product image and generate a complete e-commerce listing.
Return JSON only, no markdown, no code blocks:
{
  "titles": ["5 SEO-optimized title variations, max 140 chars each"],
  "description": {
    "overview": "2-3 sentence product summary",
    "features": ["5 key features/benefits"],
    "materials": "materials and construction details",
    "care": "care instructions"
  },
  "tags": ["13 most searchable e-commerce tags for this product"],
  "category": "suggested product category",
  "priceRange": { "low": 0, "high": 0 },
  "targetAudience": "who would buy this"
}`,
      },
    ]);

    const text = result.response.text();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return { error: 'Failed to parse listing data' };
    }

    return JSON.parse(jsonMatch[0]) as ListingData;
  } catch (error: any) {
    return { error: error.message || 'Failed to generate listing' };
  }
}

export type SEOAnalysisResult = {
  listingScore: number;
  scoreBreakdown: {
    titleQuality: number;
    descriptionCompleteness: number;
    tagRelevance: number;
    keywordOptimization: number;
  };
  suggestedKeywords: {
    keyword: string;
    relevance: 'high' | 'medium' | 'low';
    reason: string;
  }[];
  improvements: string[];
  competitorInsights: {
    typicalPriceRange: { low: number; high: number };
    commonKeywords: string[];
    differentiators: string[];
  };
};

export async function analyzeSEO(
  apiKey: string,
  imageBase64: string,
  title: string,
  description: string,
  tags: string[]
): Promise<SEOAnalysisResult | { error: string }> {
  initGemini(apiKey);
  const model = getTextModel();

  try {
    const result = await model.generateContent([
      { inlineData: { mimeType: 'image/jpeg', data: imageBase64 } },
      {
        text: `You are an e-commerce SEO expert. Analyze this product image and the following listing:
Title: "${title}"
Tags: ${tags.join(', ')}
Description: "${description}"

Return JSON only, no markdown, no code blocks:
{
  "listingScore": 0,
  "scoreBreakdown": {
    "titleQuality": 0,
    "descriptionCompleteness": 0,
    "tagRelevance": 0,
    "keywordOptimization": 0
  },
  "suggestedKeywords": [
    { "keyword": "example keyword", "relevance": "high", "reason": "why this keyword would help" }
  ],
  "improvements": ["specific suggestion 1", "specific suggestion 2"],
  "competitorInsights": {
    "typicalPriceRange": { "low": 0, "high": 0 },
    "commonKeywords": ["keyword1", "keyword2"],
    "differentiators": ["what would make this listing stand out"]
  }
}

Score each category 0-100. listingScore should be the weighted average.
Provide 8-12 keyword suggestions with relevance levels.
Provide 3-5 specific improvements.
Base competitor insights on typical e-commerce listings for similar products.`,
      },
    ]);

    const text = result.response.text();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return { error: 'Failed to parse SEO analysis' };
    }

    return JSON.parse(jsonMatch[0]) as SEOAnalysisResult;
  } catch (error: any) {
    return { error: error.message || 'Failed to analyze SEO' };
  }
}

function parseImageResponse(result: any): ImageEditResult {
  const response = result.response;
  const candidates = response.candidates;

  if (!candidates || candidates.length === 0) {
    return { error: 'No response from AI' };
  }

  const parts = candidates[0].content?.parts || [];
  let text: string | undefined;
  let imageBase64: string | undefined;

  for (const part of parts) {
    if (part.text) {
      text = part.text;
    }
    if (part.inlineData) {
      imageBase64 = part.inlineData.data;
    }
  }

  return { text, imageBase64 };
}

export function resetChat() {
  chatSession = null;
}
