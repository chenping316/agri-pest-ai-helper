
/**
 * 智谱清言 (ChatGLM) API 认证工具
 */

// API常量
const API_BASE_URL = "https://chatglm.cn/chatglm/assistant-api/v1";
const API_KEY = "79efc8b59478d8f6";
const API_SECRET = "cf7c3fe9b8f6f9d0b2abbcdd57346d71";

// 令牌响应接口
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
export async function getAccessToken(): Promise<string> {
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

// 导出API基础URL和助手ID，以便其他模块使用
export const API_CONFIG = {
  BASE_URL: API_BASE_URL,
  ASSISTANT_ID: "67d232043fa8d1e2e1563e69" // 智慧体ID
};
