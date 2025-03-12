
/**
 * ChatGLM API Client
 * API documentation: https://chatglm.cn/
 */

// API constants
const API_URL = "https://chatglm.cn/chatglm/assistant-api/v1/chat/completions";
const API_KEY = "79efc8b59478d8f6";
const API_SECRET = "cf7c3fe9b8f6f9d0b2abbcdd57346d71";

export interface ChatGLMMessage {
  role: string;
  content: string | {
    text?: string;
    image_url?: string;
  }[];
}

export interface ChatGLMRequestBody {
  model: string;
  messages: ChatGLMMessage[];
  temperature?: number;
  top_p?: number;
  max_tokens?: number;
  stream?: boolean;
}

export interface ChatGLMResponse {
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
 * 发送请求到ChatGLM API
 */
export async function callChatGLMApi(
  userPrompt: string,
  imageBase64: string,
  options: {
    temperature?: number;
    top_p?: number;
    max_tokens?: number;
    stream?: boolean;
  } = {}
): Promise<ChatGLMResponse> {
  console.log("Preparing request to ChatGLM API...");
  
  // 准备图片URL，确保有正确的格式
  const imageUrl = imageBase64.startsWith("http") 
    ? imageBase64 
    : `data:image/jpeg;base64,${imageBase64}`;
  
  // 准备请求体
  const payload: ChatGLMRequestBody = {
    model: "glm-4v",
    messages: [
      {
        role: "user", 
        content: [
          { text: userPrompt },
          { image_url: imageUrl }
        ]
      }
    ],
    temperature: options.temperature ?? 0.7,
    top_p: options.top_p ?? 0.9,
    max_tokens: options.max_tokens ?? 2000,
    stream: options.stream ?? false
  };
  
  console.log("Sending request to ChatGLM API...");
  
  // 发送API请求
  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${API_KEY}:${API_SECRET}`
    },
    body: JSON.stringify(payload)
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`ChatGLM API request failed: ${response.status} - ${errorText}`);
  }
  
  const jsonResponse = await response.json();
  console.log("Received response from ChatGLM API:", jsonResponse);
  
  return jsonResponse as ChatGLMResponse;
}
