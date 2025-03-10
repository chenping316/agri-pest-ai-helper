
/**
 * API client for plant image and data analysis
 */

import { DiagnosisResult, EnvData } from "@/types";
import { useToast } from "@/hooks/use-toast";

// API constants
const API_URL = "http://localhost:3001/api";
const API_KEY = "brx-FFTVDM5-32VMP8D-GRTTJAD-TMZ8CEA";

/**
 * Analyze plant image with API
 * @param imageBase64 Base64 encoded image
 * @param plantType Optional plant type for more accurate results
 * @param envData Optional environmental data
 * @returns DiagnosisResult with analysis results
 */
export async function analyzeImageWithZhipu(
  imageBase64: string,
  plantType?: string,
  envData?: EnvData
): Promise<DiagnosisResult> {
  try {
    console.log("Preparing request to local API...");
    
    // Remove data URL prefix if present
    const base64Image = imageBase64.includes("base64,") 
      ? imageBase64.split("base64,")[1] 
      : imageBase64;
    
    // Prepare environment data for API request
    const envDataPayload = envData ? {
      soilMoisture: envData.soilMoisture,
      soilTemperature: envData.soilTemperature,
      soilPh: envData.soilPh,
      airTemperature: envData.airTemperature,
      airHumidity: envData.airHumidity
    } : null;
    
    // Prepare request payload
    const payload = {
      imageData: base64Image,
      plantType: plantType || "unknown",
      environmentData: envDataPayload
    };
    
    console.log("Sending request to local API...");
    
    // Make API request
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${API_KEY}`
      },
      body: JSON.stringify(payload)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API request failed: ${response.status} - ${errorText}`);
    }
    
    const jsonResponse = await response.json();
    console.log("Received response from API:", jsonResponse);
    
    // Validate the response
    if (!jsonResponse || !jsonResponse.name) {
      console.error("Invalid API response format:", jsonResponse);
      return createFallbackResult(plantType, true);
    }
    
    // Format and return the diagnosis result
    return {
      name: jsonResponse.name,
      description: jsonResponse.description || "",
      confidence: jsonResponse.confidence || 0.85,
      treatments: Array.isArray(jsonResponse.treatments) 
        ? jsonResponse.treatments.map((treatment: any) => ({
            method: treatment.method,
            cost: treatment.cost || "medium",
            effectiveness: treatment.effectiveness || "medium",
            estimatedPrice: treatment.estimatedPrice || "¥50-100/亩",
            description: treatment.description || ""
          }))
        : createFallbackResult(plantType).treatments
    };
  } catch (error) {
    console.error("Error calling local API:", error);
    
    // Return fallback data in case of API failure
    return createFallbackResult(plantType, true);
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
        description: isFallback ? "确认本地API服务器正在运行并可访问" : "保持田间通风，适当控制氮肥使用量，增施钾肥。"
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
