
/**
 * 智谱AI API 类型定义
 */

// 消息类型
export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string | {
    type: string;
    text?: string;
    image_url?: {
      url: string;
    };
  }[];
}

// API请求选项
export interface ChatOptions {
  temperature?: number;
  top_p?: number;
  max_tokens?: number;
  stream?: boolean;
}

// API请求体
export interface ChatCompletionRequest {
  model: string;
  messages: ChatMessage[];
  temperature?: number;
  top_p?: number;
  max_tokens?: number;
  stream?: boolean;
}

// API响应中的选择项
export interface ChatCompletionChoice {
  finish_reason: string;
  index: number;
  message: {
    content: string;
    role: string;
  };
}

// 使用量统计
export interface ChatCompletionUsage {
  completion_tokens: number;
  prompt_tokens: number;
  total_tokens: number;
}

// API完整响应
export interface ChatCompletionResponse {
  created: number;
  id: string;
  model: string;
  request_id: string;
  choices: ChatCompletionChoice[];
  usage: ChatCompletionUsage;
}
