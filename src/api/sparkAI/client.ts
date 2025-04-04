
/**
 * 讯飞星火大模型 API 客户端 (HTTP REST API)
 */

import { API_CONFIG } from "./auth";

export interface SparkMessage {
  role: string;
  content: string;
  content_type?: "text" | "image";
}

export interface SparkApiOptions {
  temperature?: number;
  top_k?: number;
  max_tokens?: number;
}

/**
 * 调用讯飞星火大模型 HTTP REST API
 * @param userPrompt 用户输入的文本提示
 * @param imageBase64 可选的图像Base64数据
 * @param options API调用选项
 * @returns 返回AI响应文本
 */
export async function callSparkApi(
  userPrompt: string,
  imageBase64: string = "",
  options: SparkApiOptions = {}
): Promise<string> {
  try {
    // 构建消息数组
    const messages: SparkMessage[] = [];
    
    // 用户文本消息
    messages.push({
      role: "user",
      content: userPrompt
    });
    
    // 如果有图像，添加图像消息
    if (imageBase64 && imageBase64.length > 0) {
      messages.push({
        role: "user",
        content: imageBase64,
        content_type: "image"
      });
    }
    
    // 构建API请求
    const requestBody = {
      model: API_CONFIG.DEFAULT_MODEL,
      messages: messages,
      temperature: options.temperature ?? 0.7,
      top_k: options.top_k ?? 4,
      max_tokens: options.max_tokens ?? 4096
    };
    
    // 分解API密码进行身份验证
    const [appId, apiKey] = API_CONFIG.API_PASSWORD.split(":");
    
    if (!appId || !apiKey) {
      throw new Error("无效的API密码格式，应为'appId:apiKey'");
    }
    
    // 发送HTTP请求
    const response = await fetch(API_CONFIG.API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
        "X-AppId": appId
      },
      body: JSON.stringify(requestBody)
    });
    
    // 检查响应状态
    if (!response.ok) {
      const errorText = await response.text();
      console.error("星火API请求失败:", errorText);
      throw new Error(`星火API请求失败: ${response.status} ${response.statusText}`);
    }
    
    // 解析响应
    const responseData = await response.json();
    
    // 提取AI回复
    if (responseData.choices && responseData.choices.length > 0 && 
        responseData.choices[0].message && responseData.choices[0].message.content) {
      return responseData.choices[0].message.content;
    } else {
      console.error("无法从API响应中提取内容:", responseData);
      throw new Error("API响应格式无效");
    }
  } catch (error) {
    console.error("调用星火API时出错:", error);
    throw error;
  }
}
