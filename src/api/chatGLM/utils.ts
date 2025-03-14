
/**
 * 智谱清言 (ChatGLM) API 工具函数
 */

/**
 * 格式化图像URL
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
 * 从响应中提取文本内容
 * @param jsonResponse API响应
 */
export function extractTextFromResponse(jsonResponse: any): string {
  let textContent = "";
  
  try {
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
  } catch (error) {
    console.error("提取智谱清言响应文本时出错:", error);
  }
  
  return textContent;
}
