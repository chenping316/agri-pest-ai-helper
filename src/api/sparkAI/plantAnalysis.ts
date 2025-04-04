
/**
 * 讯飞星火大模型 植物疾病分析
 * 
 * 注意: 此模型已被删除，保留此文件仅作为占位符
 */

import { DiagnosisResult, EnvData } from "@/types";
import { createFallbackResult } from "./parser";

/**
 * 占位函数 - 模型已被删除
 */
export async function analyzePlantDisease(
  imageBase64: string,
  plantType?: string,
  envData?: EnvData
): Promise<DiagnosisResult> {
  console.error("讯飞星火大模型已被删除");
  return createFallbackResult(plantType, true);
}
