
/**
 * 讯飞星火大模型 API 客户端
 * API文档: https://www.xfyun.cn/doc/spark/Web.html
 */

import { API_CONFIG } from "./auth";

export interface SparkMessage {
  role: string;
  content: string | {
    text?: string;
    image?: string;
  }[];
}

export interface SparkRequestBody {
  model: string;
  messages: SparkMessage[];
  temperature?: number;
  top_k?: number;
  max_tokens?: number;
  stream?: boolean;
}

export interface SparkApiOptions {
  temperature?: number;
  top_k?: number;
  max_tokens?: number;
  stream?: boolean;
}

/**
 * 发送请求到讯飞星火大模型 API
 */
export async function callSparkApi(
  userPrompt: string,
  imageBase64: string = "",
  options: SparkApiOptions = {}
): Promise<any> {
  console.log("准备向讯飞星火大模型API发送请求...");
  
  try {
    // 准备请求体
    const payload: SparkRequestBody = {
      model: imageBase64 ? "spark-vl-3.5" : "spark-3.5", // 根据是否有图像选择模型
      messages: [],
      temperature: options.temperature ?? 0.7,
      top_k: options.top_k ?? 4,
      max_tokens: options.max_tokens ?? 2000,
      stream: options.stream ?? false
    };
    
    // 如果提供了图像，添加包含图像的消息
    if (imageBase64) {
      // 确保图像格式正确（base64 字符串，不包含前缀）
      const imageData = imageBase64.includes("base64,") 
        ? imageBase64.split("base64,")[1] 
        : imageBase64;
      
      payload.messages = [
        {
          role: "user",
          content: [
            { text: userPrompt },
            { image: imageData }
          ]
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
    
    console.log("向讯飞星火大模型API发送请求，使用模型:", payload.model);
    
    // 发送API请求
    const response = await fetch(API_CONFIG.BASE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${API_CONFIG.API_KEY}:${API_CONFIG.API_SECRET}`
      },
      body: JSON.stringify(payload)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`讯飞星火API请求失败: ${response.status} - ${errorText}`);
      throw new Error(`讯飞星火API请求失败: ${response.status} - ${errorText}`);
    }
    
    const jsonResponse = await response.json();
    console.log("收到来自讯飞星火API的响应:", jsonResponse);
    
    return jsonResponse;
  } catch (error) {
    console.error("调用讯飞星火API时出错:", error);
    throw error;
  }
}
