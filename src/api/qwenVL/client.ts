
/**
 * 通义千问 API Client
 * 使用OpenAI兼容模式API和DashScope原生API
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
 * DashScope原生API请求体接口
 */
export interface DashScopeRequestBody {
  model: string;
  input: {
    messages: {
      role: string;
      content: (
        | { text: string }
        | { image: string }
      )[];
    }[];
  };
  parameters?: {
    temperature?: number;
    top_p?: number;
    max_tokens?: number;
  };
}

/**
 * DashScope原生API响应接口
 */
export interface DashScopeResponse {
  output: {
    choices: {
      finish_reason: string;
      message: {
        role: string;
        content: { text: string }[];
      };
    }[];
  };
  usage: {
    input_tokens: number;
    output_tokens: number;
    total_tokens: number;
  };
  request_id: string;
}

/**
 * 发送请求到通义千问API (OpenAI兼容模式)
 */
export async function callQwenApi(
  userPrompt: string,
  imageBase64: string,
  options: {
    temperature?: number;
    top_p?: number;
    max_tokens?: number;
    stream?: boolean;
    useOcr?: boolean;
  } = {}
): Promise<ApiResponse> {
  console.log("准备向通义千问API(OpenAI兼容模式)发送请求...");
  
  // 数据URL格式处理
  const imageUrl = imageBase64.startsWith("data:") 
    ? imageBase64 
    : `data:image/jpeg;base64,${imageBase64}`;
  
  // 选择模型：如果指定OCR则使用OCR模型，否则使用默认VL模型
  const modelToUse = options.useOcr ? API_CONFIG.OCR_MODEL : API_CONFIG.DEFAULT_MODEL;
  
  // 准备请求体
  const payload: ApiRequestBody = {
    model: modelToUse,
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
  
  console.log(`向通义千问API发送请求，使用模型：${modelToUse}...`);
  
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

/**
 * 发送请求到通义千问API (DashScope原生模式-Llama Vision)
 */
export async function callQwenDashScopeApi(
  userPrompt: string,
  imageBase64: string,
  options: {
    temperature?: number;
    top_p?: number;
    max_tokens?: number;
  } = {}
): Promise<DashScopeResponse> {
  console.log("准备向通义千问API(DashScope原生模式)发送请求...");
  
  // 处理图像数据
  // 如果是data URL，提取base64部分
  let imageData = imageBase64;
  if (imageBase64.startsWith("data:")) {
    imageData = imageBase64.split('base64,')[1];
  }
  
  // 准备请求体
  const payload: DashScopeRequestBody = {
    model: API_CONFIG.LLAMA_VISION_MODEL,
    input: {
      messages: [
        {
          role: "user",
          content: [
            { image: imageData },
            { text: userPrompt }
          ]
        }
      ]
    },
    parameters: {
      temperature: options.temperature ?? 0.7,
      top_p: options.top_p ?? 0.9,
      max_tokens: options.max_tokens ?? 2000
    }
  };
  
  console.log(`向通义千问DashScope API发送请求，使用模型：${API_CONFIG.LLAMA_VISION_MODEL}...`);
  
  // 发送API请求
  const response = await fetch(API_CONFIG.DASHSCOPE_BASE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${API_CONFIG.API_KEY}`
    },
    body: JSON.stringify(payload)
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error(`通义千问DashScope API请求失败: ${response.status} - ${errorText}`);
    throw new Error(`通义千问DashScope API请求失败: ${response.status} - ${errorText}`);
  }
  
  const jsonResponse = await response.json();
  console.log("收到来自通义千问DashScope API的响应:", jsonResponse);
  
  return jsonResponse as DashScopeResponse;
}

/**
 * OCR文本提取专用API调用
 */
export async function extractTextWithOcr(
  imageBase64: string,
  options: {
    temperature?: number;
    top_p?: number;
    max_tokens?: number;
  } = {}
): Promise<string> {
  try {
    const response = await callQwenApi(
      "请提取图片中的所有文本内容，按照原始布局呈现。",
      imageBase64,
      {
        ...options,
        useOcr: true, // 使用OCR模型
        temperature: options.temperature ?? 0.2, // OCR任务建议低温度
      }
    );
    
    // 从响应中提取文本
    const extractedText = response.choices[0]?.message?.content || "";
    return extractedText;
  } catch (error) {
    console.error("OCR文本提取失败:", error);
    throw error;
  }
}

