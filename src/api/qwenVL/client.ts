
/**
 * 通义千问 API Client
 * 使用OpenAI兼容模式API
 */

import { API_CONFIG } from "./auth";

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
  max_tokens?: number;
  stream?: boolean;
}

export interface ApiResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: {
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
    index: number;
  }[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

/**
 * 发送请求到通义千问API
 */
export async function callQwenApi(
  userPrompt: string,
  imageBase64: string,
  options: {
    temperature?: number;
    top_p?: number;
    max_tokens?: number;
    stream?: boolean;
  } = {}
): Promise<ApiResponse> {
  console.log("准备向通义千问API发送请求...");
  
  // 数据URL格式处理
  const imageUrl = imageBase64.startsWith("data:") 
    ? imageBase64 
    : `data:image/jpeg;base64,${imageBase64}`;
  
  // 准备请求体
  const payload: ApiRequestBody = {
    model: API_CONFIG.DEFAULT_MODEL,
    messages: [
      {
        role: "user",
        content: [
          { type: "text", text: userPrompt },
          { type: "image_url", image_url: { url: imageUrl } }
        ]
      }
    ],
    temperature: options.temperature ?? 0.7,
    top_p: options.top_p ?? 0.9,
    max_tokens: options.max_tokens ?? 2000,
    stream: options.stream ?? false
  };
  
  console.log("向通义千问API发送请求...");
  
  // 发送API请求
  const response = await fetch(API_CONFIG.BASE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${API_CONFIG.API_KEY}`
    },
    body: JSON.stringify(payload)
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error(`通义千问API请求失败: ${response.status} - ${errorText}`);
    throw new Error(`通义千问API请求失败: ${response.status} - ${errorText}`);
  }
  
  const jsonResponse = await response.json();
  console.log("收到来自通义千问API的响应:", jsonResponse);
  
  return jsonResponse as ApiResponse;
}
