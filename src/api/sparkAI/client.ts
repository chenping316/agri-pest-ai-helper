
/**
 * 讯飞星火大模型 API 客户端
 * 
 * 注意: 此模型已被删除，保留此文件仅作为占位符
 */

export interface SparkMessage {
  role: string;
  content: string;
  content_type?: "text" | "image";
}

export interface SparkApiOptions {
  temperature?: number;
  top_k?: number;
  max_tokens?: number;
}

/**
 * 占位函数 - 模型已被删除
 */
export async function callSparkApi(
  userPrompt: string,
  imageBase64: string = "",
  options: SparkApiOptions = {}
): Promise<any> {
  console.error("讯飞星火大模型已被删除");
  throw new Error("讯飞星火大模型已被删除");
}
