
/**
 * ChatGLM API Client
 * API documentation: https://chatglm.cn/
 */

// API constants
const API_BASE_URL = "https://chatglm.cn/chatglm/assistant-api/v1";
const API_KEY = "79efc8b59478d8f6";
const API_SECRET = "cf7c3fe9b8f6f9d0b2abbcdd57346d71";

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
 * 获取ChatGLM API访问令牌
 */
async function getAccessToken(): Promise<string> {
  console.log("正在获取ChatGLM API访问令牌...");
  
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
    
    console.log("成功获取ChatGLM API访问令牌");
    return tokenData.result.access_token;
  } catch (error) {
    console.error("获取ChatGLM访问令牌时出错:", error);
    throw new Error(`获取ChatGLM访问令牌失败: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * 发送请求到ChatGLM API
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
  console.log("准备向ChatGLM API发送请求...");
  
  try {
    // 1. 获取访问令牌
    const accessToken = await getAccessToken();
    
    // 2. 准备图片URL，确保有正确的格式
    const imageUrl = imageBase64.startsWith("http") 
      ? imageBase64 
      : `data:image/jpeg;base64,${imageBase64}`;
    
    // 3. 准备请求体
    // 注意：根据文档，我们应该使用correct的参数结构
    const payload = {
      assistant_id: "8SFb5rRcyoxP", // 使用GLM-4V的智能体ID
      prompt: userPrompt,
      file_list: [
        {
          file_id: imageUrl // 直接传图片URL或base64
        }
      ],
      meta_data: {
        temperature: options.temperature ?? 0.7,
        top_p: options.top_p ?? 0.9,
        max_tokens: options.max_tokens ?? 2000
      }
    };
    
    console.log("向ChatGLM API发送请求...");
    
    // 4. 发送API请求
    const response = await fetch(`${API_BASE_URL}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${accessToken}`
      },
      body: JSON.stringify(payload)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`ChatGLM API请求失败: ${response.status} - ${errorText}`);
    }
    
    const jsonResponse = await response.json();
    console.log("收到来自ChatGLM API的响应:", jsonResponse);
    
    // 5. 处理响应结果
    if (jsonResponse.status !== 0) {
      throw new Error(`ChatGLM API返回错误: ${jsonResponse.message || "未知错误"}`);
    }
    
    // 6. 从响应中提取文本内容
    let textContent = "";
    if (jsonResponse.result?.message?.content?.text) {
      textContent = jsonResponse.result.message.content.text;
    } else if (typeof jsonResponse.result?.message?.content === 'object') {
      // 处理可能的复杂内容结构
      const content = jsonResponse.result.message.content;
      if (content.type === 'text') {
        textContent = content.text || "";
      }
    }
    
    // 7. 返回处理后的响应
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
    console.error("调用ChatGLM API时出错:", error);
    throw error;
  }
}
