
import { AnalysisMode, DiagnosisResult, EnvData } from "@/types";
import { analyzePlantDisease as apiAnalyzePlantDisease } from "@/api/taichuVL/plantAnalysis";

// 使用API分析植物疾病的函数
export const analyzePlantDisease = async (
  imageBase64: string,
  mode: AnalysisMode,
  plantType?: string,
  envData?: EnvData
): Promise<DiagnosisResult> => {
  console.log(`Analyzing image with mode: ${mode}, plant type: ${plantType || 'not specified'}`);
  
  try {
    // 调用API客户端分析图像
    const result = await apiAnalyzePlantDisease(
      imageBase64,
      plantType,
      mode === 'image-and-env' ? envData : undefined
    );
    
    return result;
  } catch (error) {
    console.error("Error in analyzePlantDisease:", error);
    throw error;
  }
};
