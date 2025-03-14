
/**
 * 智谱清言 (ChatGLM) API 类型定义
 */

// API请求选项接口
export interface ChatGLMOptions {
  temperature?: number;
  top_p?: number;
  max_tokens?: number;
  stream?: boolean;
}

// 消息接口类型定义
export interface ChatGLMMessage {
  role: string;
  content: string | {
    text?: string;
    image_url?: string;
  }[];
}

// API响应接口
export interface ChatGLMResponse {
  status: number;
  message?: string;
  result?: {
    history_id: string;
    conversation_id: string;
    output?: any[];
    message?: {
      role: string;
      content: any;
      status: string;
      created_at: string;
    };
    created_at: string;
    status: string;
  };
}
