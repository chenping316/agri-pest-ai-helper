
/**
 * 讯飞星火API响应解析器
 */

import { DiagnosisResult } from "@/types";

/**
 * 从API响应文本中解析出诊断结果
 * @param responseText API响应文本
 * @param plantType 可选的植物类型
 * @returns 诊断结果
 */
export function parseResponseToResult(responseText: string, plantType?: string): DiagnosisResult {
  try {
    // 尝试提取疾病名称
    const nameMatch = responseText.match(/疾病名称[：:]\s*(.+?)(?:\n|$)/i);
    const name = nameMatch ? nameMatch[1].trim() : "未知疾病";
    
    // 尝试提取描述
    const descMatch = responseText.match(/疾病描述[和与]症状[：:]\s*([\s\S]+?)(?=\n[0-9\.]|\n置信度|\n治疗方法|\n$)/i);
    const description = descMatch ? descMatch[1].trim() : "无可用描述";
    
    // 尝试提取置信度
    const confidenceMatch = responseText.match(/置信度[：:]\s*([0-9.]+)/i);
    let confidence = 0.7; // 默认置信度
    
    if (confidenceMatch && confidenceMatch[1]) {
      const confValue = parseFloat(confidenceMatch[1]);
      confidence = isNaN(confValue) ? 0.7 : confValue;
      
      // 确保置信度在0-1之间
      if (confidence > 1) confidence = confidence / 100;
      if (confidence > 1) confidence = 0.7;
    }
    
    // 提取治疗方法
    const treatmentSections = responseText.match(/(?:治疗方法|解决方案)[0-9]*[：:]\s*([\s\S]+?)(?=\n\d+\.|$)/g) || [];
    
    const treatments = [];
    
    if (treatmentSections.length > 0) {
      // 尝试从连续文本中提取多个治疗方法
      for (const section of treatmentSections) {
        const methodMatch = section.match(/方法[0-9]*[：:]\s*(.+?)(?:\n|$)/i) || 
                            section.match(/[0-9]+\.\s*(.+?)(?:\n|$)/i);
        
        if (methodMatch) {
          const method = methodMatch[1].trim();
          
          // 提取描述
          const descMatch = section.match(/描述[：:]\s*([\s\S]+?)(?=\n成本|\n有效性|\n估计价格|\n$)/i) ||
                            section.match(/步骤[：:]\s*([\s\S]+?)(?=\n成本|\n有效性|\n估计价格|\n$)/i);
          const description = descMatch ? descMatch[1].trim() : "无描述";
          
          // 提取成本
          const costMatch = section.match(/成本[：:]\s*(.+?)(?:\n|$)/i);
          const costText = costMatch ? costMatch[1].toLowerCase() : "medium";
          
          // 将成本文本映射到枚举值
          let cost: 'low' | 'medium' | 'high' = 'medium';
          if (costText.includes('低') || costText.includes('少') || costText.includes('low')) {
            cost = 'low';
          } else if (costText.includes('高') || costText.includes('多') || costText.includes('high')) {
            cost = 'high';
          }
          
          // 提取有效性
          const effectMatch = section.match(/有效性[：:]\s*(.+?)(?:\n|$)/i);
          const effectText = effectMatch ? effectMatch[1].toLowerCase() : "medium";
          
          // 将有效性文本映射到枚举值
          let effectiveness: 'low' | 'medium' | 'high' = 'medium';
          if (effectText.includes('低') || effectText.includes('差') || effectText.includes('low')) {
            effectiveness = 'low';
          } else if (effectText.includes('高') || effectText.includes('好') || effectText.includes('high')) {
            effectiveness = 'high';
          }
          
          // 提取估计价格
          const priceMatch = section.match(/估计价格[：:]\s*(.+?)(?:\n|$)/i) ||
                             section.match(/价格[：:]\s*(.+?)(?:\n|$)/i);
          const estimatedPrice = priceMatch ? priceMatch[1].trim() : "未知";
          
          treatments.push({
            method,
            description,
            cost,
            effectiveness,
            estimatedPrice
          });
        }
      }
    }
    
    // 如果没有提取到治疗方法，尝试通用模式
    if (treatments.length === 0) {
      // 通用模式：查找编号列表形式的治疗方法
      const methodMatches = responseText.match(/[0-9]+\.\s*(.+?)(?:\n|$)/g);
      
      if (methodMatches && methodMatches.length > 0) {
        for (const methodMatch of methodMatches) {
          const method = methodMatch.replace(/^[0-9]+\.\s*/, '').trim();
          if (method && method.length > 3) {
            treatments.push({
              method,
              description: "请按照建议方法进行处理。",
              cost: 'medium',
              effectiveness: 'medium',
              estimatedPrice: "未知"
            });
          }
        }
      }
    }
    
    // 如果仍然没有提取到治疗方法，添加一个默认方法
    if (treatments.length === 0) {
      treatments.push({
        method: "咨询专业人士",
        description: "由于无法从AI响应中提取治疗方法，建议咨询专业的植物医生或园艺专家以获取针对性建议。",
        cost: 'medium',
        effectiveness: 'high',
        estimatedPrice: "视具体情况而定"
      });
    }
    
    // 限制最多返回4个治疗方法
    const limitedTreatments = treatments.slice(0, 4);
    
    return {
      name,
      description,
      confidence,
      treatments: limitedTreatments
    };
  } catch (error) {
    console.error("解析星火API响应失败:", error);
    return createFallbackResult(plantType);
  }
}

/**
 * 创建回退结果（当API调用失败时使用）
 */
export function createFallbackResult(plantType?: string, isAPIFailure: boolean = false): DiagnosisResult {
  const plantTypeText = plantType || "未知植物";
  
  return {
    name: `${isAPIFailure ? "星火AI: " : ""}无法识别`,
    description: `无法识别${plantTypeText}的病害。这可能是由于图像不清晰、网络连接问题或其他原因造成的。请尝试使用更清晰的图像重新分析，或尝试使用其他模型。`,
    confidence: 0.01,
    treatments: [
      {
        method: "重新拍摄",
        description: "使用更好的光线拍摄更清晰的图像，确保病害部位在画面中清晰可见。",
        cost: 'low',
        effectiveness: 'medium',
        estimatedPrice: "免费"
      },
      {
        method: "尝试其他模型",
        description: "使用其他AI模型进行分析，如太初视觉模型或智谱GLM。",
        cost: 'low',
        effectiveness: 'medium',
        estimatedPrice: "免费"
      },
      {
        method: "咨询专家",
        description: "咨询当地的植物医生或园艺专家，获取专业诊断和治疗建议。",
        cost: 'medium',
        effectiveness: 'high',
        estimatedPrice: "可能需要支付咨询费"
      }
    ]
  };
}
