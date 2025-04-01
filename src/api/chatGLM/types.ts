
/**
 * 智谱AI API 类型定义
 */

// 消息角色类型
export type MessageRole = "user" | "assistant" | "system" | "tool";

// 消息内容类型
export type MessageContent = string | {
  type: string;
  text?: string;
  image_url?: {
    url: string;
  };
}[];

// 消息类型
export interface ChatMessage {
  role: MessageRole;
  content: MessageContent;
  tool_calls?: ToolCall[];
  tool_call_id?: string;
}

// 工具调用类型
export interface ToolCall {
  id: string;
  type: string;
  function: {
    name: string;
    arguments: string;
  };
}

// API请求选项
export interface ChatOptions {
  temperature?: number;
  top_p?: number;
  max_tokens?: number;
  stream?: boolean;
  do_sample?: boolean;
  response_format?: {
    type: "text" | "json_object";
  };
}

// API请求体
export interface ChatCompletionRequest {
  model: string;
  messages: ChatMessage[];
  temperature?: number;
  top_p?: number;
  max_tokens?: number;
  stream?: boolean;
  do_sample?: boolean;
  response_format?: {
    type: "text" | "json_object";
  };
}

// API响应中的选择项
export interface ChatCompletionChoice {
  finish_reason: string;
  index: number;
  message: {
    content: string;
    role: string;
    tool_calls?: ToolCall[];
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
