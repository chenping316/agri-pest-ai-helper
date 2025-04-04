
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
      text: string;
    };
    usage?: {
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
 * 创建WebSocket鉴权URL
 */
function createAuthUrl(): string {
  const apiUrl = new URL(API_CONFIG.API_URL);
  const host = apiUrl.host;
  const path = apiUrl.pathname;
  const date = formatDate();
  
  // 步骤1: 拼接签名字符串
  const tmp = `host: ${host}\ndate: ${date}\nGET ${path} HTTP/1.1`;
  
  // 步骤2: 使用HMAC-SHA256算法结合APISecret对tmp进行签名
  const signatureSha = CryptoJS.HmacSHA256(tmp, API_CONFIG.API_SECRET);
  const signature = CryptoJS.enc.Base64.stringify(signatureSha);
  
  // 步骤3: 拼接authorization_origin
  const authorizationOrigin = `api_key="${API_CONFIG.API_KEY}", algorithm="hmac-sha256", headers="host date request-line", signature="${signature}"`;
  
  // 步骤4: 对authorization_origin进行base64编码
  const authorization = CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(authorizationOrigin));
  
  // 步骤5: 组装鉴权URL
  const url = new URL(API_CONFIG.API_URL);
  url.searchParams.append("authorization", authorization);
  url.searchParams.append("date", date);
  url.searchParams.append("host", host);
  
  return url.toString();
}

/**
 * 使用WebSocket发送请求到讯飞星火大模型
 */
export async function callSparkApi(
  userPrompt: string,
  imageBase64: string = "",
  options: SparkApiOptions = {}
): Promise<any> {
  console.log("准备连接讯飞星火大模型 WebSocket API...");
  
  return new Promise((resolve, reject) => {
    try {
      // 1. 创建鉴权URL
      const authUrl = createAuthUrl();
      
      // 2. 建立WebSocket连接
      const ws = new WebSocket(authUrl);
      
      // 保存响应文本
      let responseText = "";
      
      // 处理WebSocket事件
      ws.onopen = () => {
        console.log("WebSocket连接已建立，正在发送请求...");
        
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
        const requestBody: SparkRequestBody = {
          header: {
            app_id: API_CONFIG.APP_ID
          },
          parameter: {
            chat: {
              domain: "general",
              temperature: options.temperature ?? 0.7,
              top_k: options.top_k ?? 4,
              max_tokens: options.max_tokens ?? 2000
            }
          },
          payload: {
            message: {
              text: messages
            }
          }
        };
        
        // 发送请求
        ws.send(JSON.stringify(requestBody));
      };
      
      ws.onmessage = (event) => {
        try {
          const response = JSON.parse(event.data) as SparkResponse;
          
          // 检查是否有错误
          if (response.header.code !== 0) {
            console.error("讯飞星火API返回错误:", response.header.message);
            ws.close();
            reject(new Error(`讯飞星火API错误: ${response.header.code} - ${response.header.message}`));
            return;
          }
          
          // 累积响应文本
          if (response.payload.choices.status === 2) {
            // 这是最后一条消息
            responseText += response.payload.choices.text || "";
            
            // 返回结果
            resolve({
              payload: {
                choices: {
                  text: responseText
                }
              }
            });
            
            // 关闭WebSocket连接
            ws.close();
          } else {
            // 累积部分响应
            responseText += response.payload.choices.text || "";
          }
        } catch (error) {
          console.error("解析WebSocket消息时出错:", error);
          reject(error);
        }
      };
      
      ws.onerror = (error) => {
        console.error("WebSocket连接错误:", error);
        reject(error);
      };
      
      ws.onclose = (event) => {
        if (event.code !== 1000) {
          console.error(`WebSocket连接非正常关闭，代码: ${event.code}`);
          reject(new Error(`WebSocket连接关闭: ${event.code}`));
        }
      };
      
      // 设置超时
      const timeout = setTimeout(() => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.close();
          reject(new Error("WebSocket请求超时"));
        }
      }, 30000); // 30秒超时
      
      // 清理超时
      ws.onclose = () => {
        clearTimeout(timeout);
      };
      
    } catch (error) {
      console.error("调用讯飞星火API (WebSocket) 时出错:", error);
      reject(error);
    }
  });
}
