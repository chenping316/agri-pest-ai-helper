
/**
 * 通义千问 API 认证信息
 */

// API配置
export const API_CONFIG = {
  // 兼容OpenAI接口的基础URL
  BASE_URL: "https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions",
  // DashScope原生API基础URL
  DASHSCOPE_BASE_URL: "https://dashscope.aliyuncs.com/api/v1/services/aigc/multimodal-generation/generation",
  // API密钥
  API_KEY: "sk-a7e3ebb3d5ee4e3ea708bfd86adcd5b0",
  // 默认模型
  DEFAULT_MODEL: "qwen-vl-plus",
  // OCR模型
  OCR_MODEL: "qwen-vl-ocr",
  // Llama Vision模型
  LLAMA_VISION_MODEL: "llama3.2-90b-vision-instruct"
};
