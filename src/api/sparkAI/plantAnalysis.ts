
/**
 * 讯飞星火大模型 植物疾病分析
 */

import { DiagnosisResult, EnvData } from "@/types";
import { callSparkApi } from "./client";
import { parseResponseToResult } from "./parser";
import { toast } from "sonner";

/**
 * 使用讯飞星火大模型分析植物疾病
 * @param imageBase64 植物图像的Base64编码
 * @param plantType 可选的植物类型
 * @param envData 可选的环境数据
 * @returns 诊断结果
 */
export async function analyzePlantDisease(
  imageBase64: string,
  plantType?: string,
  envData?: EnvData
): Promise<DiagnosisResult> {
  try {
    // 构建提示内容
    let prompt = "你是一位专业的植物病害识别专家和园艺顾问。";
    prompt += "以下是一张植物图片，请通过图像分析该植物可能患有的疾病。";
    
    if (plantType) {
      prompt += `这是一株${plantType}植物。`;
    }
    
    if (envData) {
      prompt += `当前环境数据：温度 ${envData.temperature}°C，`;
      prompt += `湿度 ${envData.humidity}%，`;
      prompt += `光照 ${envData.light} lux，`;
      prompt += `土壤湿度 ${envData.soilMoisture}%。`;
    }
    
    prompt += "请提供以下信息：\n";
    prompt += "1. 疾病名称\n";
    prompt += "2. 疾病描述和症状\n";
    prompt += "3. 置信度评估（0-1之间的数值）\n";
    prompt += "4. 至少2-3种治疗方法，每种方法包括：具体步骤、成本（低/中/高）、有效性（低/中/高）和估计价格\n";
    prompt += "请提供有条理、专业的回答，以便我能够理解并处理植物的问题。";
    
    // 调用API
    const apiResponse = await callSparkApi(
      prompt,
      imageBase64,
      { temperature: 0.3, max_tokens: 2048 }
    );
    
    // 解析响应
    const result = parseResponseToResult(apiResponse, plantType);
    return result;
  } catch (error) {
    console.error("星火AI植物分析失败:", error);
    toast.error("星火AI分析失败，请稍后重试");
    
    // 返回一个带有错误信息的结果
    return {
      name: "星火AI: 分析失败",
      description: `无法完成分析，发生错误: ${error instanceof Error ? error.message : String(error)}`,
      confidence: 0.01,
      treatments: [
        {
          method: "重试分析",
          description: "请稍后再次尝试分析，或检查网络连接状态。",
          cost: 'low',
          effectiveness: 'medium',
          estimatedPrice: "免费"
        },
        {
          method: "使用其他模型",
          description: "尝试使用其他AI模型进行分析，如太初视觉模型或智谱GLM。",
          cost: 'low',
          effectiveness: 'medium',
          estimatedPrice: "免费"
        }
      ]
    };
  }
}
