
/**
 * 智谱AI API 客户端
 * API文档: https://open.bigmodel.cn/dev/api
 */

import { API_CONFIG } from "./auth";
import { formatImageUrl, createMessageWithImage, extractTextFromResponse } from "./utils";
import { ChatCompletionRequest, ChatOptions } from "./types";

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
      model: options.stream ? "glm-4-plus-vision" : "glm-4-plus",
      messages: [],
      temperature: options.temperature ?? 0.7,
      top_p: options.top_p ?? 0.9,
      max_tokens: options.max_tokens ?? 2000,
      stream: options.stream ?? false
    };
    
    // 如果提供了图像，添加包含图像的消息
    if (imageBase64) {
      payload.model = "glm-4-plus-vision"; // 使用支持图像的模型
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
      throw new Error(`智谱AI API请求失败: ${response.status} - ${errorText}`);
    }
    
    const jsonResponse = await response.json();
    console.log("收到来自智谱AI API的响应:", jsonResponse);
    
    // 直接返回API响应，保持与OpenAI格式兼容性
    return {
      ...jsonResponse,
      model: jsonResponse.model || payload.model
    };
  } catch (error) {
    console.error("调用智谱AI API时出错:", error);
    throw error;
  }
}
