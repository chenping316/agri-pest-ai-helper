
/**
 * 智谱清言 (ChatGLM) API 客户端
 * API文档: https://chatglm.cn/chatglm/assistant-api/v1/
 */

// API常量
const API_BASE_URL = "https://chatglm.cn/chatglm/assistant-api/v1";
const API_KEY = "79efc8b59478d8f6";
const API_SECRET = "cf7c3fe9b8f6f9d0b2abbcdd57346d71";
const ASSISTANT_ID = "67d232043fa8d1e2e1563e69"; // 智慧体ID

// API请求选项接口
export interface ChatGLMOptions {
  temperature?: number;
  top_p?: number;
  max_tokens?: number;
  stream?: boolean;
}

// 接口类型定义
export interface ChatGLMMessage {
  role: string;
  content: string | {
    text?: string;
    image_url?: string;
  }[];
}

export interface ChatGLMResponse {
  status: number;
  message?: string;
  result?: {
    history_id: string;
    conversation_id: string;
    output?: any[];
    message?: {
      role: string;
      content: any;
      status: string;
      created_at: string;
    };
    created_at: string;
    status: string;
  };
}

interface TokenResponse {
  status: number;
  message?: string;
  result?: {
    access_token: string;
    expires_in: number;
  };
}

/**
 * 获取智谱清言API访问令牌
 */
async function getAccessToken(): Promise<string> {
  console.log("正在获取智谱清言API访问令牌...");
  
  try {
    const response = await fetch(`${API_BASE_URL}/get_token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        api_key: API_KEY,
        api_secret: API_SECRET
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`获取令牌失败: ${response.status} - ${errorText}`);
    }
    
    const tokenData = await response.json() as TokenResponse;
    
    if (tokenData.status !== 0 || !tokenData.result?.access_token) {
      throw new Error(`获取令牌失败: ${tokenData.message || "未知错误"}`);
    }
    
    console.log("成功获取智谱清言API访问令牌");
    return tokenData.result.access_token;
  } catch (error) {
    console.error("获取智谱清言访问令牌时出错:", error);
    throw new Error(`获取智谱清言访问令牌失败: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * 格式化图像URL
 * @param imageBase64 图像的Base64字符串或URL
 */
function formatImageUrl(imageBase64: string): string {
  return imageBase64.startsWith("http") 
    ? imageBase64 
    : `data:image/jpeg;base64,${imageBase64}`;
}

/**
 * 从响应中提取文本内容
 * @param jsonResponse API响应
 */
function extractTextFromResponse(jsonResponse: any): string {
  let textContent = "";
  
  // 处理非流式响应
  if (jsonResponse.result?.output && Array.isArray(jsonResponse.result.output)) {
    // 从output数组中查找文本内容
    for (const part of jsonResponse.result.output) {
      if (part.content && part.content.type === 'text' && part.content.text) {
        textContent += part.content.text;
      }
    }
  } 
  // 处理流式响应
  else if (jsonResponse.result?.message?.content) {
    const content = jsonResponse.result.message.content;
    
    if (typeof content === 'string') {
      textContent = content;
    } else if (content.type === 'text') {
      textContent = content.text || "";
    } else if (Array.isArray(content) && content.length > 0) {
      // 处理可能的数组格式内容
      const textItems = content
        .filter(item => item.type === 'text' || item.text)
        .map(item => item.text || "");
      textContent = textItems.join('\n');
    }
  }
  
  return textContent;
}

/**
 * 发送请求到智谱清言API
 * @param userPrompt 用户提示
 * @param imageBase64 图像的Base64字符串或URL
 * @param options API选项
 */
export async function callChatGLMApi(
  userPrompt: string,
  imageBase64: string,
  options: ChatGLMOptions = {}
): Promise<any> {
  console.log("准备向智谱清言API发送请求...");
  
  try {
    // 1. 获取访问令牌
    const accessToken = await getAccessToken();
    
    // 2. 准备图片URL，确保有正确的格式
    const imageUrl = formatImageUrl(imageBase64);
    
    // 3. 准备请求体 - 符合新API规范
    const payload = {
      assistant_id: ASSISTANT_ID,
      prompt: userPrompt,
      file_list: imageBase64 ? [{ file_id: imageUrl }] : [],
      meta_data: {
        temperature: options.temperature ?? 0.7,
        top_p: options.top_p ?? 0.9,
        max_tokens: options.max_tokens ?? 2000
      }
    };
    
    console.log("向智谱清言API发送请求...");
    
    // 4. 发送API请求 - 使用非流式接口 stream_sync
    const endpoint = options.stream ? "/stream" : "/stream_sync";
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
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
    
    // 5. 处理响应结果
    if (jsonResponse.status !== 0) {
      throw new Error(`智谱清言API返回错误: ${jsonResponse.message || "未知错误"}`);
    }
    
    // 6. 从响应中提取文本内容
    const textContent = extractTextFromResponse(jsonResponse);
    
    // 7. 返回处理后的响应，保持与OpenAI格式兼容
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
