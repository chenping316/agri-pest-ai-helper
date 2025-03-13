
/**
 * NYAI (ChatGLM) API Client
 * API documentation: https://chatglm.cn/
 */

// API constants
const API_BASE_URL = "https://chatglm.cn/chatglm/assistant-api/v1";
const API_KEY = "79efc8b59478d8f6";
const API_SECRET = "cf7c3fe9b8f6f9d0b2abbcdd57346d71";
const ASSISTANT_ID = "67d232043fa8d1e2e1563e69"; // Updated assistant ID

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
    message: {
      role: string;
      content: {
        type: string;
        text?: string;
      };
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
 * 获取NYAI API访问令牌
 */
async function getAccessToken(): Promise<string> {
  console.log("正在获取NYAI API访问令牌...");
  
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
    
    console.log("成功获取NYAI API访问令牌");
    return tokenData.result.access_token;
  } catch (error) {
    console.error("获取NYAI访问令牌时出错:", error);
    throw new Error(`获取NYAI访问令牌失败: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * 发送请求到NYAI API
 */
export async function callChatGLMApi(
  userPrompt: string,
  imageBase64: string,
  options: {
    temperature?: number;
    top_p?: number;
    max_tokens?: number;
    stream?: boolean;
  } = {}
): Promise<any> {
  console.log("准备向NYAI API发送请求...");
  
  try {
    // 1. 获取访问令牌
    const accessToken = await getAccessToken();
    
    // 2. 准备图片URL，确保有正确的格式
    const imageUrl = imageBase64.startsWith("http") 
      ? imageBase64 
      : `data:image/jpeg;base64,${imageBase64}`;
    
    // 3. 优化请求体结构，使用ASSISTANT_ID智慧体ID和符合API规范的结构
    const payload = {
      assistant_id: ASSISTANT_ID, // 使用更新后的智慧体ID
      prompt: userPrompt,
      file_list: imageBase64 ? [{ file_id: imageUrl }] : [],
      meta_data: {
        temperature: options.temperature ?? 0.7,
        top_p: options.top_p ?? 0.9,
        max_tokens: options.max_tokens ?? 2000
      }
    };
    
    console.log("向NYAI API发送请求...");
    
    // 4. 使用正确的端点和请求头
    // 注意: 使用非流式输出端点，方便处理响应
    const endpoint = options.stream ? "/stream" : "/chat/completions";
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
      throw new Error(`NYAI API请求失败: ${response.status} - ${errorText}`);
    }
    
    const jsonResponse = await response.json();
    console.log("收到来自NYAI API的响应:", jsonResponse);
    
    // 5. 处理响应结果
    if (jsonResponse.status !== 0) {
      throw new Error(`NYAI API返回错误: ${jsonResponse.message || "未知错误"}`);
    }
    
    // 6. 从响应中提取文本内容
    let textContent = "";
    const message = jsonResponse.result?.message;
    
    if (message?.content) {
      const content = message.content;
      
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
      }
    };
  } catch (error) {
    console.error("调用NYAI API时出错:", error);
    throw error;
  }
}
