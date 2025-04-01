
/**
 * 智谱AI API 工具函数
 */

/**
 * 格式化图像URL为API所需格式
 * @param imageBase64 图像的Base64字符串或URL
 */
export function formatImageUrl(imageBase64: string): string {
  if (!imageBase64) return "";
  
  // 检查是否已经是完整的URL
  return imageBase64.startsWith("http") 
    ? imageBase64 
    : `data:image/jpeg;base64,${imageBase64}`;
}

/**
 * 创建包含图像的消息内容
 * @param text 文本内容
 * @param imageUrl 图像URL
 */
export function createMessageWithImage(text: string, imageUrl: string) {
  return [
    {
      type: "text",
      text: text
    },
    {
      type: "image_url",
      image_url: {
        url: formatImageUrl(imageUrl)
      }
    }
  ];
}

/**
 * 从API响应中提取文本内容
 * @param response API响应
 */
export function extractTextFromResponse(response: any): string {
  try {
    if (response?.choices && response.choices.length > 0) {
      return response.choices[0].message.content || "";
    }
    return "";
  } catch (error) {
    console.error("提取智谱AI响应文本时出错:", error);
    return "";
  }
}

/**
 * 生成随机请求ID
 */
export function generateRequestId(): string {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
}
