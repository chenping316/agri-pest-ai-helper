
/**
 * 讯飞星火大模型 API 客户端
 * API文档: https://www.xfyun.cn/doc/spark/Web.html
 */

import { API_CONFIG } from "./auth";
import CryptoJS from 'crypto-js';

export interface SparkMessage {
  role: string;
  content: string | {
    text?: string;
    image?: string;
  }[];
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

/**
 * 生成认证URL
 */
function createSignedUrl(): string {
  const hostUrl = API_CONFIG.WS_URL;
  const apiKey = API_CONFIG.API_KEY;
  const apiSecret = API_CONFIG.API_SECRET;
  
  // 构建鉴权参数
  const date = new Date().toUTCString();
  const algorithm = 'hmac-sha256';
  const headers = 'host date request-line';
  const signatureOrigin = `host: ${new URL(hostUrl).host}\ndate: ${date}\nGET /v1.1/chat HTTP/1.1`;
  
  // 使用CryptoJS生成签名
  const signatureSha = CryptoJS.HmacSHA256(signatureOrigin, apiSecret);
  const signature = CryptoJS.enc.Base64.stringify(signatureSha);
  
  // 构建鉴权字符串
  const authorizationOrigin = `api_key="${apiKey}", algorithm="${algorithm}", headers="${headers}", signature="${signature}"`;
  
  // 使用Base64编码
  const authorization = btoa(authorizationOrigin);
  
  // 将所有参数拼接在URL上
  const websocketUrl = `${hostUrl}?authorization=${encodeURIComponent(authorization)}&date=${encodeURIComponent(date)}&host=${encodeURIComponent(new URL(hostUrl).host)}`;
  
  return websocketUrl;
}

/**
 * WebSocket连接状态管理
 */
let currentWebsocket: WebSocket | null = null;
let pendingResolve: ((value: any) => void) | null = null;
let pendingReject: ((error: any) => void) | null = null;
let responseData: string = '';

/**
 * 发送请求到讯飞星火大模型 API (WebSocket版)
 */
export async function callSparkApi(
  userPrompt: string,
  imageBase64: string = "",
  options: SparkApiOptions = {}
): Promise<any> {
  console.log("准备向讯飞星火大模型API发送WebSocket请求...");
  
  try {
    // 准备认证URL
    const wsUrl = createSignedUrl();
    
    // 准备请求体
    const payload: SparkRequestBody = {
      header: {
        app_id: API_CONFIG.APP_ID,
        uid: "user123" // 可选用户ID
      },
      parameter: {
        chat: {
          domain: imageBase64 ? "spark-vl-3.5" : "lite",
          temperature: options.temperature ?? 0.7,
          top_k: options.top_k ?? 4,
          max_tokens: options.max_tokens ?? 2000,
          auditing: false
        }
      },
      payload: {
        message: {
          text: []
        }
      }
    };
    
    // 如果提供了图像，添加包含图像的消息
    if (imageBase64) {
      // 确保图像格式正确（base64 字符串，不包含前缀）
      const imageData = imageBase64.includes("base64,") 
        ? imageBase64.split("base64,")[1] 
        : imageBase64;
      
      payload.payload.message.text = [{
        role: "user",
        content: [
          { text: userPrompt },
          { image: imageData }
        ]
      }];
    } else {
      // 纯文本消息
      payload.payload.message.text = [{
        role: "user",
        content: userPrompt
      }];
    }
    
    console.log("向讯飞星火大模型API发送WebSocket请求，使用模型:", payload.parameter.chat.domain);
    
    // 创建一个Promise来处理WebSocket通信
    return new Promise((resolve, reject) => {
      // 保存Promise的resolve和reject函数，以便WebSocket事件处理程序可以访问它们
      pendingResolve = resolve;
      pendingReject = reject;
      responseData = '';
      
      // 创建WebSocket连接
      const ws = new WebSocket(wsUrl);
      currentWebsocket = ws;
      
      // 连接打开时，发送请求
      ws.onopen = () => {
        console.log("WebSocket连接已打开，发送数据...");
        ws.send(JSON.stringify(payload));
      };
      
      // 接收消息
      ws.onmessage = (event) => {
        try {
          const response = JSON.parse(event.data);
          console.log("WebSocket收到消息:", response);
          
          // 检查是否有错误
          if (response.header?.code !== 0) {
            const errorMsg = `讯飞星火API错误: ${response.header?.message || '未知错误'}`;
            console.error(errorMsg);
            ws.close();
            pendingReject && pendingReject(new Error(errorMsg));
            pendingResolve = null;
            pendingReject = null;
            return;
          }
          
          // 累积响应数据
          if (response.payload?.choices?.text) {
            responseData += response.payload.choices.text[0].content || "";
          }
          
          // 检查是否完成
          if (response.header?.status === 2) {
            // 构建完整响应
            const fullResponse = {
              payload: {
                choices: {
                  text: [responseData]
                }
              }
            };
            
            // 关闭WebSocket并解析Promise
            ws.close();
            pendingResolve && pendingResolve(fullResponse);
            pendingResolve = null;
            pendingReject = null;
          }
        } catch (error) {
          console.error("解析WebSocket消息失败:", error);
          ws.close();
          pendingReject && pendingReject(error);
          pendingResolve = null;
          pendingReject = null;
        }
      };
      
      // 处理错误
      ws.onerror = (error) => {
        console.error("WebSocket错误:", error);
        pendingReject && pendingReject(error);
        pendingResolve = null;
        pendingReject = null;
      };
      
      // 连接关闭
      ws.onclose = () => {
        console.log("WebSocket连接已关闭");
        currentWebsocket = null;
        
        // 如果Promise还未解析，则认为是错误
        if (pendingResolve && pendingReject) {
          pendingReject(new Error("WebSocket连接意外关闭"));
          pendingResolve = null;
          pendingReject = null;
        }
      };
      
      // 设置超时
      setTimeout(() => {
        if (pendingResolve && pendingReject) {
          console.error("WebSocket请求超时");
          ws.close();
          pendingReject(new Error("WebSocket请求超时"));
          pendingResolve = null;
          pendingReject = null;
        }
      }, 30000); // 30秒超时
    });
  } catch (error) {
    console.error("调用讯飞星火API (WebSocket) 时出错:", error);
    throw error;
  }
}
