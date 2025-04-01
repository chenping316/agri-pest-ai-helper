
/**
 * 智谱AI 植物疾病分析
 */

import { DiagnosisResult, EnvData } from "@/types";
import { callChatGLMApi } from "./client";
import { parseResponseToResult, createFallbackResult } from "./parser";
import { API_CONFIG } from "./auth";

/**
 * 使用智谱AI分析植物图像进行疾病诊断
 */
export async function analyzePlantDisease(
  imageBase64: string,
  plantType?: string,
  envData?: EnvData
): Promise<DiagnosisResult> {
  try {
    // 移除数据URL前缀（如果存在）
    const base64Image = imageBase64.includes("base64,") 
      ? imageBase64.split("base64,")[1] 
      : imageBase64;
    
    // 准备环境数据字符串
    let envDataString = "";
    if (envData) {
      envDataString = `
环境数据:
- 土壤湿度: ${envData.soilMoisture}%
- 土壤温度: ${envData.soilTemperature}°C
- 土壤pH值: ${envData.soilPh}
- 空气温度: ${envData.airTemperature}°C
- 空气湿度: ${envData.airHumidity}%`;
    }
    
    // 为模型创建提示
    const plantTypeInfo = plantType ? `植物类型: ${plantType}` : "植物类型: 未知";
    const userPrompt = `请分析这张植物图片，诊断可能的病害。
${plantTypeInfo}
${envDataString}

请按以下格式回复:
1. 病害名称
2. 病害描述(包括症状特征、发病规律和危害程度)
3. 置信度(0-1之间的数值)
4. 治疗方案(请为每种方法提供详细说明):
   - 方法名称
   - 具体实施步骤(至少3-5个步骤)
   - 所需材料/药剂及用量
   - 适用条件和最佳时机
   - 操作注意事项
   - 成本级别(低/中/高)
   - 有效性级别(低/中/高)
   - 估计价格
   - 预期效果`;

    // 调用API - 修正这里，不传递model参数，而是使用API_CONFIG中的VISION_MODEL
    const apiResponse = await callChatGLMApi(
      userPrompt,
      base64Image,
      {
        temperature: 0.7,
        max_tokens: 2000
      }
    );
    
    // 提取文本响应
    const responseText = apiResponse.choices?.[0]?.message?.content || "";
    
    // 解析响应为结构化结果
    return parseResponseToResult(responseText, plantType);
  } catch (error) {
    console.error("Error calling 智谱AI API:", error);
    // 在API失败的情况下返回回退数据
    return createFallbackResult(plantType, true);
  }
}
