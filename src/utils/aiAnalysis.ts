
import { AnalysisMode, DiagnosisResult, EnvData } from "@/types";
import { analyzePlantDisease as taichuAnalyzePlantDisease } from "@/api/taichuVL/plantAnalysis";
import { analyzePlantDisease as chatGLMAnalyzePlantDisease } from "@/api/chatGLM/plantAnalysis";
import { toast } from "sonner";

/**
 * 使用单一模型分析植物疾病的函数
 */
export const analyzePlantDisease = async (
  imageBase64: string,
  mode: AnalysisMode,
  plantType?: string,
  envData?: EnvData
): Promise<DiagnosisResult> => {
  console.log(`Analyzing image with mode: ${mode}, plant type: ${plantType || 'not specified'}`);
  
  try {
    // 调用API客户端分析图像
    const result = await taichuAnalyzePlantDisease(
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

/**
 * 综合使用多个模型分析植物疾病的函数
 */
export const analyzeWithMultipleModels = async (
  imageBase64: string,
  mode: AnalysisMode,
  plantType?: string,
  envData?: EnvData
): Promise<DiagnosisResult> => {
  console.log(`Starting multi-model analysis with mode: ${mode}, plant type: ${plantType || 'not specified'}`);
  
  try {
    // 并行调用两个模型API以减少等待时间
    const [taichuPromise, chatGLMPromise] = [
      taichuAnalyzePlantDisease(
        imageBase64,
        plantType,
        mode === 'image-and-env' ? envData : undefined
      ).catch(error => {
        console.error("Error in Taichu-VL analysis:", error);
        toast.error("Taichu-VL模型分析失败，将仅使用ChatGLM结果");
        return null;
      }),
      
      chatGLMAnalyzePlantDisease(
        imageBase64,
        plantType,
        mode === 'image-and-env' ? envData : undefined
      ).catch(error => {
        console.error("Error in ChatGLM analysis:", error);
        toast.error("ChatGLM模型分析失败，将仅使用Taichu-VL结果");
        return null;
      })
    ];
    
    // 等待所有模型的结果
    const [taichuResult, chatGLMResult] = await Promise.all([taichuPromise, chatGLMPromise]);
    
    // 如果两个模型都失败，抛出错误
    if (!taichuResult && !chatGLMResult) {
      throw new Error("所有模型分析都失败了");
    }
    
    // 如果只有一个模型成功，返回成功的那个结果
    if (!taichuResult) return chatGLMResult!;
    if (!chatGLMResult) return taichuResult;
    
    // 综合两个模型的结果
    return combineResults(taichuResult, chatGLMResult);
  } catch (error) {
    console.error("Error in multi-model analysis:", error);
    throw error;
  }
};

/**
 * 综合两个模型的分析结果
 */
function combineResults(result1: DiagnosisResult, result2: DiagnosisResult): DiagnosisResult {
  console.log("Combining results from multiple models");
  
  // 如果疾病名称相同，增加置信度，否则选择置信度较高的
  const useResult1 = 
    result1.name === result2.name ? true :  // 名称相同使用结果1作为基础
    result1.confidence >= result2.confidence;  // 否则使用置信度高的
  
  // 选择基础结果
  const baseResult = useResult1 ? result1 : result2;
  const secondaryResult = useResult1 ? result2 : result1;
  
  // 计算新的置信度
  let newConfidence = baseResult.confidence;
  
  // 如果两个模型得出相同的病害名称，提高置信度
  if (result1.name === result2.name) {
    // 取两者的平均值并略微提高
    newConfidence = Math.min(1, (result1.confidence + result2.confidence) / 2 + 0.1);
  }
  
  // 合并处理方法（取两者的前2种方法）
  const combinedTreatments = [
    ...baseResult.treatments.slice(0, 2),
    ...secondaryResult.treatments
      .filter(t => !baseResult.treatments.slice(0, 2).some(bt => bt.method === t.method))
      .slice(0, 2)
  ];
  
  return {
    name: baseResult.name,
    description: baseResult.description.length > secondaryResult.description.length 
      ? baseResult.description 
      : secondaryResult.description,
    confidence: newConfidence,
    treatments: combinedTreatments
  };
}
