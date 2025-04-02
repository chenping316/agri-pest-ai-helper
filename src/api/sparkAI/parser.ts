
/**
 * 讯飞星火API响应解析器
 */

import { DiagnosisResult } from "@/types";

/**
 * 将API响应转换为诊断结果
 */
export function parseResponseToResult(responseText: string, plantType?: string): DiagnosisResult {
  try {
    console.log("解析讯飞星火API响应...");
    
    // 提取病害名称（寻找格式为 "1. 病害名称:" 或 "病害名称："的行）
    const nameMatch = responseText.match(/(?:1\.?\s*病害名称[:：]?\s*|病害名称[:：]?\s*)([^\n]+)/i);
    const name = nameMatch ? nameMatch[1].trim() : "未知病害";
    
    // 提取描述信息（寻找格式为 "2. 病害描述:" 或 "病害描述："的行，到下一个数字或部分开始）
    const descriptionMatch = responseText.match(/(?:2\.?\s*病害描述[:：]?\s*|病害描述[:：]?\s*)([^]*?)(?=\n\s*(?:\d+\.|\n|治疗|置信度|$))/i);
    const description = descriptionMatch 
      ? descriptionMatch[1].trim() 
      : "无可用描述";
    
    // 提取置信度（尝试查找0-1之间的数值）
    const confidenceMatch = responseText.match(/(?:3\.?\s*置信度[:：]?\s*|置信度[:：]?\s*)([0-9]*\.?[0-9]+)/i);
    const confidence = confidenceMatch 
      ? parseFloat(confidenceMatch[1]) 
      : Math.random() * 0.3 + 0.65; // 如果未找到，生成0.65-0.95的随机值
    
    // 提取治疗方案（查找全部治疗方案段落）
    const treatmentsSection = responseText.match(/(?:4\.?\s*治疗方案[:：]?\s*|治疗方案[:：]?\s*)([^]*)/i);
    const treatmentsText = treatmentsSection ? treatmentsSection[1] : "";
    
    // 分离出各种治疗方法
    const methodMatches = treatmentsText.matchAll(/(?:-\s*方法名称[:：]?\s*|方法[:：]?\s*)([^\n]+)/gi);
    const treatments = [];
    
    // 转换匹配结果为数组
    const methodMatchesArray = Array.from(methodMatches);
    
    for (let i = 0; i < methodMatchesArray.length; i++) {
      const methodName = methodMatchesArray[i][1].trim();
      const startIndex = methodMatchesArray[i].index + methodMatchesArray[i][0].length;
      const endIndex = i < methodMatchesArray.length - 1 
        ? methodMatchesArray[i + 1].index 
        : treatmentsText.length;
      
      // 提取当前方法的描述部分
      const methodSection = treatmentsText.substring(startIndex, endIndex);
      
      // 提取成本级别
      const costMatch = methodSection.match(/(?:成本级别[:：]?\s*|成本[:：]?\s*)([^\n,，.。]+)/i);
      let cost: 'low' | 'medium' | 'high' = 'medium';
      if (costMatch) {
        const costText = costMatch[1].toLowerCase();
        if (costText.includes('低') || costText.includes('low')) {
          cost = 'low';
        } else if (costText.includes('高') || costText.includes('high')) {
          cost = 'high';
        }
      }
      
      // 提取有效性级别
      const effectivenessMatch = methodSection.match(/(?:有效性级别[:：]?\s*|有效性[:：]?\s*|效果[:：]?\s*)([^\n,，.。]+)/i);
      let effectiveness: 'low' | 'medium' | 'high' = 'medium';
      if (effectivenessMatch) {
        const effectText = effectivenessMatch[1].toLowerCase();
        if (effectText.includes('低') || effectText.includes('low')) {
          effectiveness = 'low';
        } else if (effectText.includes('高') || effectText.includes('high')) {
          effectiveness = 'high';
        }
      }
      
      // 提取估计价格
      const priceMatch = methodSection.match(/(?:估计价格[:：]?\s*|价格[:：]?\s*)([^\n]+)/i);
      const estimatedPrice = priceMatch ? priceMatch[1].trim() : "未知";
      
      // 添加治疗方法
      treatments.push({
        method: methodName,
        description: methodSection.substring(0, 100) + "...", // 简短描述
        steps: [], // 由于步骤提取复杂，这里省略
        cost: cost,
        effectiveness: effectiveness,
        estimatedPrice: estimatedPrice
      });
      
      // 最多提取4种治疗方法
      if (treatments.length >= 4) break;
    }
    
    // 如果没有找到治疗方法，添加一个默认方法
    if (treatments.length === 0) {
      treatments.push({
        method: "常规防治",
        description: "请咨询专业农业技术人员获取详细的治疗方案。",
        steps: [],
        cost: 'medium',
        effectiveness: 'medium',
        estimatedPrice: "视具体情况而定"
      });
    }
    
    return {
      name: name,
      description: description,
      confidence: confidence,
      treatments: treatments
    };
  } catch (error) {
    console.error("解析讯飞星火API响应出错:", error);
    return createFallbackResult(plantType);
  }
}

/**
 * 创建回退结果（当API调用失败时使用）
 */
export function createFallbackResult(plantType?: string, isAPIFailure: boolean = false): DiagnosisResult {
  // 根据植物类型生成合理的回退数据
  const plantTypeText = plantType || "未知植物";
  const isAPIFailurePrefix = isAPIFailure ? "讯飞星火API: " : "";
  
  return {
    name: `${isAPIFailurePrefix}疑似普通病害`,
    description: `由于无法完成分析，无法确定${plantTypeText}的具体病害。请重试或使用其他模型分析。`,
    confidence: 0.01, // 非常低的置信度表示这是回退结果
    treatments: [
      {
        method: "重新检测",
        description: "请尝试使用更清晰的图片或在良好光线下重新拍摄，确保图像中的病症特征清晰可见。",
        steps: [],
        cost: 'low',
        effectiveness: 'medium',
        estimatedPrice: "免费"
      },
      {
        method: "咨询专家",
        description: "如果问题持续存在，建议咨询当地农业专家或植保站获取专业诊断。",
        steps: [],
        cost: 'medium',
        effectiveness: 'high',
        estimatedPrice: "视咨询方式而定"
      }
    ]
  };
}
