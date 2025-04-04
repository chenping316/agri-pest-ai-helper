
/**
 * 讯飞星火API响应解析器
 * 
 * 注意: 此模型已被删除，保留此文件仅作为占位符
 */

import { DiagnosisResult } from "@/types";

/**
 * 占位函数 - 模型已被删除
 */
export function parseResponseToResult(responseText: string, plantType?: string): DiagnosisResult {
  console.error("讯飞星火大模型已被删除");
  return createFallbackResult(plantType);
}

/**
 * 创建回退结果（当API调用失败时使用）
 */
export function createFallbackResult(plantType?: string, isAPIFailure: boolean = false): DiagnosisResult {
  const plantTypeText = plantType || "未知植物";
  const isAPIFailurePrefix = isAPIFailure ? "讯飞星火API: " : "";
  
  return {
    name: `${isAPIFailurePrefix}模型已被删除`,
    description: `讯飞星火大模型已被从系统中移除。请使用其他可用模型进行分析。`,
    confidence: 0.01,
    treatments: [
      {
        method: "请使用其他模型",
        description: "讯飞星火大模型已被移除，请在分析页面选择其他可用的分析模型。",
        cost: 'low',
        effectiveness: 'medium',
        estimatedPrice: "免费"
      }
    ]
  };
}
