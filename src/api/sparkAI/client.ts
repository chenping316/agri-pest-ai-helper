
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
 * 使用HTTP REST API调用讯飞星火大模型
 */
export async function callSparkApi(
  userPrompt: string,
  imageBase64: string = "",
  options: SparkApiOptions = {}
): Promise<any> {
  console.log("准备调用讯飞星火大模型 HTTP REST API...");
  
  try {
    // 准备消息内容
    const messages: SparkMessage[] = [];
    
    // 如果有图像，添加图像消息
    if (imageBase64) {
      // 确保图像格式正确（base64 字符串，不包含前缀）
      const imageData = imageBase64.includes("base64,") 
        ? imageBase64.split("base64,")[1] 
        : imageBase64;
      
      messages.push({
        role: "user",
        content: imageData,
        content_type: "image"
      });
    }
    
    // 添加文本消息
    messages.push({
      role: "user",
      content: userPrompt
    });
    
    // 准备请求体
    const requestBody = {
      model: API_CONFIG.DEFAULT_MODEL,
      messages: messages,
      temperature: options.temperature ?? 0.7,
      top_k: options.top_k ?? 4,
      max_tokens: options.max_tokens ?? 2000
    };
    
    // 准备请求头
    const headers = {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${API_CONFIG.API_PASSWORD}`
    };
    
    // 发送HTTP请求
    const response = await fetch(API_CONFIG.API_URL, {
      method: "POST",
      headers: headers,
      body: JSON.stringify(requestBody)
    });
    
    // 检查响应状态
    if (!response.ok) {
      const errorData = await response.json();
      console.error("讯飞星火API返回错误:", errorData);
      throw new Error(`讯飞星火API错误: ${response.status} - ${errorData.error?.message || '未知错误'}`);
    }
    
    // 解析响应
    const responseData = await response.json();
    
    return {
      payload: {
        choices: {
          text: responseData.choices[0]?.message?.content || ""
        }
      }
    };
  } catch (error) {
    console.error("调用讯飞星火API时出错:", error);
    throw error;
  }
}
