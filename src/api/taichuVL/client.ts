
/**
 * Taichu-VL API Client
 * API documentation: https://platform.wair.ac.cn
 */

// API constants
const API_URL = "https://platform.wair.ac.cn/maas/v1/chat/completions";
const API_KEY = "3lo5ej5dwl7vivm95l36oljo";
const API_KEY_ID = "33787015";
const MODEL_NAME = "Taichu-VL";

interface ApiRequestOptions {
  systemPrompt: string;
  userPrompt: string;
  imageBase64: string;
  temperature?: number;
  maxTokens?: number;
}

export interface ApiResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: {
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

/**
 * Make a request to the Taichu-VL API
 */
export async function callTaichuVLApi({
  systemPrompt,
  userPrompt,
  imageBase64,
  temperature = 0.7,
  maxTokens = 1000
}: ApiRequestOptions): Promise<ApiResponse> {
  console.log("Preparing request to Taichu-VL API...");
  
  // Prepare request payload
  const payload = {
    model: MODEL_NAME,
    messages: [
      { role: "system", content: systemPrompt },
      { 
        role: "user", 
        content: [
          { type: "text", text: userPrompt },
          { type: "image_url", image_url: { url: `data:image/jpeg;base64,${imageBase64}` } }
        ]
      }
    ],
    temperature,
    max_tokens: maxTokens
  };
  
  console.log("Sending request to Taichu-VL API...");
  
  // Make API request
  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${API_KEY}`,
      "X-MaaS-Key-Id": API_KEY_ID
    },
    body: JSON.stringify(payload)
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API request failed: ${response.status} - ${errorText}`);
  }
  
  const jsonResponse = await response.json();
  console.log("Received response from API:", jsonResponse);
  
  return jsonResponse as ApiResponse;
}
