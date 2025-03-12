
/**
 * Taichu-VL API Client
 * API documentation: https://platform.wair.ac.cn
 */

// API constants
const API_URL = "https://ai-maas.wair.ac.cn/maas/v1/chat/completions";
const API_KEY = "3lo5ej5dwl7vivm95l36oljo"; // 应根据实际情况配置
const API_KEY_ID = "33787015"; // 只在某些情况下需要

export interface ApiMessage {
  role: string;
  content: (
    | { type: "text"; text: string }
    | { type: "image_url"; image_url: { url: string } }
  )[];
}

export interface ApiRequestBody {
  model: string;
  messages: ApiMessage[];
  temperature?: number;
  top_p?: number;
  repetition_penalty?: number;
  stream?: boolean;
  max_tokens?: number;
  system_prompt?: string;
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
 * 发送请求到Taichu-VL API
 */
export async function callTaichuVLApi(
  userPrompt: string,
  imageBase64: string,
  systemPrompt: string = "",
  options: {
    temperature?: number;
    top_p?: number;
    repetition_penalty?: number;
    max_tokens?: number;
    stream?: boolean;
  } = {}
): Promise<ApiResponse> {
  console.log("Preparing request to Taichu-VL API...");
  
  // 准备请求体
  const payload: ApiRequestBody = {
    model: "taichu_vl", // 根据curl示例使用小写并带下划线
    messages: [
      {
        role: "user", 
        content: [
          { type: "text", text: userPrompt },
          { 
            type: "image_url", 
            image_url: { 
              url: imageBase64.startsWith("http") 
                ? imageBase64 
                : `data:image/jpeg;base64,${imageBase64}` 
            } 
          }
        ]
      }
    ],
    temperature: options.temperature ?? 0.8,
    top_p: options.top_p ?? 0.9,
    repetition_penalty: options.repetition_penalty ?? 1,
    max_tokens: options.max_tokens ?? 3000,
    stream: options.stream ?? false
  };
  
  // 如果提供了系统提示，则添加
  if (systemPrompt) {
    payload.system_prompt = systemPrompt;
  }
  
  console.log("Sending request to Taichu-VL API...");
  
  // 发送API请求
  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${API_KEY}`
      // 如果需要X-MaaS-Key-Id，可以添加这一行
      // "X-MaaS-Key-Id": API_KEY_ID
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
