
import { DiagnosisResult, EnvData, Treatment } from "@/types";
import { callTaichuVLApi } from "./client";

/**
 * Analyze plant image for disease diagnosis
 */
export async function analyzePlantDisease(
  imageBase64: string,
  plantType?: string,
  envData?: EnvData
): Promise<DiagnosisResult> {
  try {
    // Remove data URL prefix if present
    const base64Image = imageBase64.includes("base64,") 
      ? imageBase64.split("base64,")[1] 
      : imageBase64;
    
    // Prepare environment data string
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
    
    // Create prompts for the model
    const plantTypeInfo = plantType ? `植物类型: ${plantType}` : "植物类型: 未知";
    const systemPrompt = "你是一个专业的植物病害诊断助手，可以根据图片识别植物病害并提供治疗方案。";
    const userPrompt = `请分析这张植物图片，诊断可能的病害。
${plantTypeInfo}
${envDataString}

请按以下格式回复:
1. 病害名称
2. 病害描述
3. 置信度(0-1之间的数值)
4. 治疗方案(包括方法、成本级别(低/中/高)、有效性级别(低/中/高)、估计价格、详细描述)`;

    // Call the API
    const apiResponse = await callTaichuVLApi({
      systemPrompt,
      userPrompt,
      imageBase64: base64Image
    });
    
    // Extract the text response
    const responseText = apiResponse.choices?.[0]?.message?.content || "";
    
    // Parse the response text into structured data
    return parseResponseToResult(responseText, plantType);
  } catch (error) {
    console.error("Error calling Taichu-VL API:", error);
    // Return fallback data in case of API failure
    return createFallbackResult(plantType, true);
  }
}

/**
 * Parse the text response from the Taichu-VL API into structured data
 */
function parseResponseToResult(responseText: string, plantType?: string): DiagnosisResult {
  try {
    // Extract disease name (typically after "病害名称:" or numbered as "1.")
    const nameMatch = responseText.match(/病害名称[:：]\s*(.+?)(?:\n|$)/) || 
                      responseText.match(/1\.\s*(.+?)(?:\n|$)/);
    const name = nameMatch ? nameMatch[1].trim() : "未知病害";
    
    // Extract description
    const descMatch = responseText.match(/病害描述[:：]\s*([\s\S]+?)(?=\n\d\.|\n置信度|\n治疗方案|$)/) ||
                      responseText.match(/2\.\s*([\s\S]+?)(?=\n\d\.|\n置信度|\n治疗方案|$)/);
    const description = descMatch ? descMatch[1].trim() : "无描述";
    
    // Extract confidence
    const confMatch = responseText.match(/置信度[:：]\s*(0\.\d+|1\.0|1)/) ||
                      responseText.match(/3\.\s*(0\.\d+|1\.0|1)/);
    const confidence = confMatch ? parseFloat(confMatch[1]) : 0.7;
    
    // Parse treatments
    const treatments = parseTreatments(responseText);
    
    return {
      name,
      description,
      confidence,
      treatments: treatments.slice(0, 4) // Limit to 4 treatments
    };
  } catch (error) {
    console.error("Error parsing API response:", error);
    return createFallbackResult(plantType);
  }
}

/**
 * Parse treatment information from the API response text
 */
function parseTreatments(responseText: string): Treatment[] {
  const treatments: Treatment[] = [];
  
  // Try to find treatment section
  const treatmentSection = responseText.match(/治疗方案[:：]\s*([\s\S]+)$/) ||
                          responseText.match(/4\.\s*([\s\S]+)$/) ||
                          responseText.match(/治疗方法[:：]\s*([\s\S]+)$/) ||
                          { index: responseText.indexOf("治疗"), 1: responseText.substring(responseText.indexOf("治疗")) };
  
  if (treatmentSection && treatmentSection[1]) {
    const treatmentText = treatmentSection[1];
    
    // Try to find numbered methods or separate by paragraphs
    const methodMatches = treatmentText.match(/(\d+)[\.、]([^（(]*)[（(]([^)）]*)[)）]([^0-9\n]*)/g) ||
                         treatmentText.split(/\n\s*\n/);
    
    if (methodMatches && methodMatches.length > 0) {
      for (const methodMatch of methodMatches) {
        // Extract components
        const methodNameMatch = methodMatch.match(/方法[:：]\s*(.+?)(?:\n|$)/) || 
                              { 1: methodMatch.includes("：") ? methodMatch.split("：")[0].trim() : methodMatch.split("\n")[0].trim() };
        
        const costMatch = methodMatch.match(/成本[:：]\s*(低|中|高)/) ||
                         methodMatch.match(/(低|中|高)\s*成本/);
        
        const effectMatch = methodMatch.match(/有效性[:：]\s*(低|中|高)/) ||
                           methodMatch.match(/(低|中|高)\s*有效/) ||
                           methodMatch.match(/效果[:：]\s*(低|中|高)/);
        
        const priceMatch = methodMatch.match(/价格[:：]\s*([^\/\n]+\/[^\n]+)/) ||
                          methodMatch.match(/([¥￥]\d+[\-～至]\d+\/[亩次株]+)/);
        
        const descMatch = methodMatch.match(/描述[:：]\s*(.+)/) ||
                         { 1: methodMatch.includes("：") && methodMatch.split("：").length > 1 ? 
                            methodMatch.split("：").slice(1).join("：").trim() : 
                            methodMatch.split("\n").slice(1).join("\n").trim() };
        
        treatments.push({
          method: methodNameMatch[1] || "喷洒杀菌剂",
          cost: (costMatch ? costMatch[1] : "medium") as "low" | "medium" | "high",
          effectiveness: (effectMatch ? effectMatch[1] : "medium") as "low" | "medium" | "high",
          estimatedPrice: priceMatch ? priceMatch[1] : "¥50-100/亩",
          description: descMatch[1] || "对病害进行治疗"
        });
        
        // Limit to 4 treatments
        if (treatments.length >= 4) break;
      }
    }
  }
  
  // Add default treatments if none were found or not enough
  addDefaultTreatments(treatments);
  
  return treatments;
}

/**
 * Add default treatments if none were found or not enough
 */
function addDefaultTreatments(treatments: Treatment[]): void {
  // If no treatments found, add at least one generic treatment
  if (treatments.length === 0) {
    treatments.push({
      method: "喷洒杀菌剂",
      cost: "medium",
      effectiveness: "high",
      estimatedPrice: "¥40-60/亩",
      description: "使用专业杀菌剂喷洒，每7-10天一次，连续2-3次。"
    });
  }
  
  // Ensure we have 4 treatments for UI consistency
  while (treatments.length < 4) {
    const methods = ["农业措施", "生物防治", "抗病品种", "物理防治"];
    const descriptions = [
      "保持田间通风，适当控制氮肥使用量，增施钾肥。",
      "使用拮抗微生物制剂，抑制病菌生长。",
      "选用抗病品种，可显著减少病害发生。",
      "适当修剪病叶，及时清理病残体，减少传染源。"
    ];
    
    treatments.push({
      method: methods[treatments.length % methods.length],
      cost: "medium",
      effectiveness: "medium",
      estimatedPrice: "¥30-50/亩",
      description: descriptions[treatments.length % descriptions.length]
    });
  }
}

/**
 * Create fallback diagnosis result if API call fails
 */
function createFallbackResult(plantType?: string, isFallback: boolean = false): DiagnosisResult {
  console.log("Using fallback diagnosis result");
  
  // Select a common disease based on plant type if available
  let diseaseName = isFallback ? "网络连接错误 - 无法分析图片" : "叶斑病";
  let description = isFallback 
    ? "无法连接到API进行图片分析。请检查网络连接后重试，或尝试使用其他图片。以下是示例结果。" 
    : "叶斑病是一种常见的植物疾病，表现为叶片上出现不规则的褐色或黑色斑点。";
  
  if (plantType && !isFallback) {
    if (plantType.includes("水稻")) {
      diseaseName = "稻瘟病";
      description = "稻瘟病是由稻瘟病菌引起的一种常见的水稻疾病，表现为叶片上的褐色病斑和花颈部变黑。";
    } else if (plantType.includes("小麦")) {
      diseaseName = "小麦锈病";
      description = "小麦锈病是由真菌引起的植物病害，表现为叶片上出现橙黄色或褐色的粉状物。";
    } else if (plantType.includes("黄瓜") || plantType.includes("番茄") || plantType.includes("茄子")) {
      diseaseName = "霜霉病";
      description = "霜霉病是由真菌引起的疾病，在叶片表面形成白色或灰色的霉状物，严重时导致叶片枯死。";
    }
  }
  
  return {
    name: diseaseName,
    description: description,
    confidence: isFallback ? 0.01 : 0.7,
    treatments: [
      {
        method: isFallback ? "重试连接" : "喷洒杀菌剂",
        cost: "medium",
        effectiveness: "high",
        estimatedPrice: "¥40-60/亩",
        description: isFallback ? "检查网络连接并重试分析" : "使用专业杀菌剂喷洒，每7-10天一次，连续2-3次。"
      },
      {
        method: isFallback ? "检查API配置" : "农业措施",
        cost: "low",
        effectiveness: "medium",
        estimatedPrice: "¥0-20/亩",
        description: isFallback ? "确认API密钥和密钥ID是否正确" : "保持田间通风，适当控制氮肥使用量，增施钾肥。"
      },
      {
        method: isFallback ? "使用较小图片" : "生物防治",
        cost: "medium",
        effectiveness: "medium",
        estimatedPrice: "¥30-50/亩",
        description: isFallback ? "尝试使用分辨率较低的图片，可能有助于减少网络传输错误" : "使用拮抗微生物制剂，抑制病菌生长。"
      },
      {
        method: isFallback ? "重启应用" : "抗病品种",
        cost: "high",
        effectiveness: "high",
        estimatedPrice: "¥50-80/亩",
        description: isFallback ? "关闭并重新打开应用后再次尝试" : "选用抗病品种，可显著减少病害发生。"
      }
    ]
  };
}
