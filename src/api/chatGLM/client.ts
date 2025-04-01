
/**
 * 智谱AI API 客户端
 * API文档: https://open.bigmodel.cn/dev/api
 */

import { API_CONFIG } from "./auth";
import { formatImageUrl, createMessageWithImage, extractTextFromResponse, generateRequestId } from "./utils";
import { ChatCompletionRequest, ChatOptions, ChatMessage } from "./types";

/**
 * 发送请求到智谱AI API
 * @param userPrompt 用户提示
 * @param imageBase64 图像的Base64字符串或URL (可选)
 * @param options API选项
 */
export async function callChatGLMApi(
  userPrompt: string,
  imageBase64: string = "",
  options: ChatOptions = {}
): Promise<any> {
  console.log("准备向智谱AI API发送请求...");
  
  try {
    // 准备请求体
    const payload: ChatCompletionRequest = {
      model: imageBase64 ? API_CONFIG.VISION_MODEL : API_CONFIG.DEFAULT_MODEL,
      messages: [],
      temperature: options.temperature ?? 0.7,
      top_p: options.top_p ?? 0.9,
      max_tokens: options.max_tokens ?? 2000,
      stream: options.stream ?? false,
      do_sample: options.do_sample ?? true
    };
    
    // 如果提供了图像，添加包含图像的消息
    if (imageBase64) {
      payload.messages = [
        {
          role: "user",
          content: createMessageWithImage(userPrompt, imageBase64)
        }
      ];
    } else {
      // 纯文本消息
      payload.messages = [
        {
          role: "user",
          content: userPrompt
        }
      ];
    }
    
    console.log("向智谱AI API发送请求, 使用模型:", payload.model);
    
    // 发送API请求
    const response = await fetch(`${API_CONFIG.BASE_URL}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${API_CONFIG.API_KEY}`
      },
      body: JSON.stringify(payload)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`智谱AI API请求失败: ${response.status} - ${errorText}`);
      throw new Error(`智谱AI API请求失败: ${response.status} - ${errorText}`);
    }
    
    const jsonResponse = await response.json();
    console.log("收到来自智谱AI API的响应:", jsonResponse);
    
    return jsonResponse;
  } catch (error) {
    console.error("调用智谱AI API时出错:", error);
    throw error;
  }
}

/**
 * 发送请求到智谱AI API并支持多轮对话
 * @param messages 对话消息列表
 * @param options API选项
 */
export async function chatWithGLM(
  messages: ChatMessage[],
  options: ChatOptions = {}
): Promise<any> {
  console.log("准备向智谱AI API发送多轮对话请求...");
  
  try {
    // 检查是否包含图像消息
    let hasImage = false;
    for (const message of messages) {
      if (Array.isArray(message.content)) {
        for (const content of message.content) {
          if (content.type === "image_url") {
            hasImage = true;
            break;
          }
        }
      }
      if (hasImage) break;
    }
    
    // 准备请求体
    const payload: ChatCompletionRequest = {
      model: hasImage ? API_CONFIG.VISION_MODEL : API_CONFIG.DEFAULT_MODEL,
      messages: messages,
      temperature: options.temperature ?? 0.7,
      top_p: options.top_p ?? 0.9,
      max_tokens: options.max_tokens ?? 2000,
      stream: options.stream ?? false,
      do_sample: options.do_sample ?? true
    };
    
    if (options.response_format) {
      payload.response_format = options.response_format;
    }
    
    console.log("向智谱AI API发送多轮对话请求, 使用模型:", payload.model);
    
    // 发送API请求
    const response = await fetch(`${API_CONFIG.BASE_URL}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${API_CONFIG.API_KEY}`
      },
      body: JSON.stringify(payload)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`智谱AI API请求失败: ${response.status} - ${errorText}`);
      throw new Error(`智谱AI API请求失败: ${response.status} - ${errorText}`);
    }
    
    const jsonResponse = await response.json();
    console.log("收到来自智谱AI API的响应:", jsonResponse);
    
    return jsonResponse;
  } catch (error) {
    console.error("调用智谱AI API时出错:", error);
    throw error;
  }
}
