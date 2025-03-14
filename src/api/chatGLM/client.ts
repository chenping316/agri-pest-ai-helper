
/**
 * 智谱清言 (ChatGLM) API 客户端
 * API文档: https://chatglm.cn/chatglm/assistant-api/v1/
 */

import { getAccessToken, API_CONFIG } from "./auth";
import { formatImageUrl, extractTextFromResponse } from "./utils";
import { ChatGLMOptions, ChatGLMResponse } from "./types";

/**
 * 发送请求到智谱清言API
 * @param userPrompt 用户提示
 * @param imageBase64 图像的Base64字符串或URL (可选)
 * @param options API选项
 */
export async function callChatGLMApi(
  userPrompt: string,
  imageBase64: string = "",
  options: ChatGLMOptions = {}
): Promise<any> {
  console.log("准备向智谱清言API发送请求...");
  
  try {
    // 1. 获取访问令牌
    const accessToken = await getAccessToken();
    
    // 2. 准备请求体
    const payload: any = {
      assistant_id: API_CONFIG.ASSISTANT_ID,
      prompt: userPrompt,
      meta_data: {
        temperature: options.temperature ?? 0.7,
        top_p: options.top_p ?? 0.9,
        max_tokens: options.max_tokens ?? 2000
      }
    };
    
    // 如果提供了图像，添加到文件列表
    if (imageBase64) {
      const imageUrl = formatImageUrl(imageBase64);
      payload.file_list = [{ file_id: imageUrl }];
    }
    
    console.log("向智谱清言API发送请求...");
    
    // 3. 发送API请求 - 使用非流式接口 stream_sync
    const endpoint = options.stream ? "/stream" : "/stream_sync";
    const response = await fetch(`${API_CONFIG.BASE_URL}${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${accessToken}`
      },
      body: JSON.stringify(payload)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`智谱清言API请求失败: ${response.status} - ${errorText}`);
    }
    
    const jsonResponse = await response.json();
    console.log("收到来自智谱清言API的响应:", jsonResponse);
    
    // 4. 处理响应结果
    if (jsonResponse.status !== 0) {
      throw new Error(`智谱清言API返回错误: ${jsonResponse.message || "未知错误"}`);
    }
    
    // 5. 从响应中提取文本内容
    const textContent = extractTextFromResponse(jsonResponse);
    
    // 6. 返回处理后的响应，保持与OpenAI格式兼容
    return {
      choices: [
        {
          message: {
            role: "assistant",
            content: textContent
          },
          finish_reason: "stop"
        }
      ],
      usage: {
        prompt_tokens: 0,
        completion_tokens: 0,
        total_tokens: 0
      },
      model: "智谱清言" // 添加模型名称
    };
  } catch (error) {
    console.error("调用智谱清言API时出错:", error);
    throw error;
  }
}
