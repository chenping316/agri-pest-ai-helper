
/**
 * 讯飞星火大模型 API 客户端
 * API文档: https://www.xfyun.cn/doc/spark/Web.html
 */

import { API_CONFIG } from "./auth";
import CryptoJS from 'crypto-js';
import { format } from 'date-fns';

export interface SparkMessage {
  role: string;
  content: string;
  content_type?: "text" | "image";
}

export interface SparkRequestBody {
  header: {
    app_id: string;
    uid?: string;
  };
  parameter: {
    chat: {
      domain: string;
      temperature?: number;
      top_k?: number;
      max_tokens?: number;
      auditing?: boolean;
    }
  };
  payload: {
    message: {
      text?: SparkMessage[];
    }
  };
}

export interface SparkApiOptions {
  temperature?: number;
  top_k?: number;
  max_tokens?: number;
  stream?: boolean;
}

interface SparkResponse {
  header: {
    code: number;
    message: string;
    sid: string;
    status: number;
  };
  payload: {
    choices: {
      status: number;
      seq: number;
      text: {
        role: string;
        content: string;
        index: number;
      }[];
    };
    usage: {
      text: {
        question_tokens: number;
        prompt_tokens: number;
        completion_tokens: number;
        total_tokens: number;
      };
    };
  };
}

/**
 * 生成RFC1123格式的GMT时间戳
 */
function formatDate(): string {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  const now = new Date();
  const day = days[now.getUTCDay()];
  const date = now.getUTCDate().toString().padStart(2, '0');
  const month = months[now.getUTCMonth()];
  const year = now.getUTCFullYear();
  const hour = now.getUTCHours().toString().padStart(2, '0');
  const minute = now.getUTCMinutes().toString().padStart(2, '0');
  const second = now.getUTCSeconds().toString().padStart(2, '0');
  
  return `${day}, ${date} ${month} ${year} ${hour}:${minute}:${second} GMT`;
}

/**
 * 创建鉴权URL
 */
function createAuthorizationHeader(host: string, date: string, path: string): string {
  // 步骤1: 拼接签名字符串
  const tmp = `host: ${host}\ndate: ${date}\nGET ${path} HTTP/1.1`;
  
  // 步骤2: 使用HMAC-SHA256算法结合APISecret对tmp进行签名
  const signatureSha = CryptoJS.HmacSHA256(tmp, API_CONFIG.API_SECRET);
  const signature = CryptoJS.enc.Base64.stringify(signatureSha);
  
  // 步骤3: 拼接authorization_origin
  const authorizationOrigin = `api_key="${API_CONFIG.API_KEY}", algorithm="hmac-sha256", headers="host date request-line", signature="${signature}"`;
  
  // 步骤4: 对authorization_origin进行base64编码
  return CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(authorizationOrigin));
}

/**
 * 发送请求到讯飞星火大模型 API (HTTP版)
 */
export async function callSparkApi(
  userPrompt: string,
  imageBase64: string = "",
  options: SparkApiOptions = {}
): Promise<any> {
  console.log("准备向讯飞星火大模型API发送HTTP请求...");
  
  try {
    const url = new URL(API_CONFIG.API_URL);
    const host = url.host;
    const path = url.pathname;
    const date = formatDate();
    
    // 生成鉴权信息
    const authorization = createAuthorizationHeader(host, date, path);
    
    // 准备请求头
    const headers = {
      "Content-Type": "application/json",
      "Authorization": authorization,
      "Date": date,
      "Host": host
    };
    
    // 准备消息内容
    const messages: SparkMessage[] = [];
    
    // 如果有图像，添加图像消息（base64格式）
    if (imageBase64) {
      // 确保图像格式正确（base64 字符串，不包含前缀）
      const imageData = imageBase64.includes("base64,") 
        ? imageBase64.split("base64,")[1] 
        : imageBase64;
      
      // 对于Spark REST API，图像和文本需要分开发送
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
      max_tokens: options.max_tokens ?? 2000,
      stream: options.stream ?? false
    };
    
    console.log(`向讯飞星火大模型API发送HTTP请求，使用模型: ${API_CONFIG.DEFAULT_MODEL}`);
    
    // 发送API请求
    const response = await fetch(API_CONFIG.API_URL, {
      method: "POST",
      headers: headers,
      body: JSON.stringify(requestBody)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`讯飞星火API请求失败: ${response.status} - ${errorText}`);
      throw new Error(`讯飞星火API请求失败: ${response.status} - ${errorText}`);
    }
    
    const jsonResponse = await response.json();
    console.log("收到来自讯飞星火API的响应:", jsonResponse);
    
    // 处理响应格式，转换为统一的格式
    return {
      payload: {
        choices: {
          text: jsonResponse.choices[0].message.content
        }
      }
    };
  } catch (error) {
    console.error("调用讯飞星火API (HTTP) 时出错:", error);
    throw error;
  }
}
