
import { AnalysisMode, DiagnosisResult, EnvData } from "@/types";
import { analyzePlantDisease as taichuAnalyzePlantDisease } from "@/api/taichuVL/plantAnalysis";
import { analyzePlantDisease as chatGLMAnalyzePlantDisease } from "@/api/chatGLM/plantAnalysis";
import { toast } from "sonner";

/**
 * 定义分析模型类型
 */
export type AnalysisModelType = 'taichu' | 'zhipu' | 'multi';

/**
 * 使用单一模型分析植物疾病的函数
 */
export const analyzePlantDisease = async (
  imageBase64: string,
  mode: AnalysisMode,
  plantType?: string,
  envData?: EnvData,
  modelType: AnalysisModelType = 'taichu'
): Promise<DiagnosisResult> => {
  console.log(`使用${modelType}模型分析图像，模式: ${mode}, 植物类型: ${plantType || '未指定'}`);
  
  try {
    // 根据指定的模型类型调用相应的API
    if (modelType === 'zhipu') {
      // 使用智谱AI模型 (GLM-4)
      return await chatGLMAnalyzePlantDisease(
        imageBase64,
        plantType,
        mode === 'image-and-env' ? envData : undefined
      );
    } else {
      // 默认使用Taichu-VL模型
      return await taichuAnalyzePlantDisease(
        imageBase64,
        plantType,
        mode === 'image-and-env' ? envData : undefined
      );
    }
  } catch (error) {
    console.error(`${modelType}模型分析出错:`, error);
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
  console.log(`开始多模型分析，模式: ${mode}, 植物类型: ${plantType || '未指定'}`);
  
  // 定义模型分析结果和错误
  let taichuResult: DiagnosisResult | null = null;
  let taichuError: any = null;
  let zhipuResult: DiagnosisResult | null = null;
  let zhipuError: any = null;
  
  try {
    // 并行调用两个模型API以减少等待时间
    [taichuResult, zhipuResult] = await Promise.all([
      // Taichu-VL 模型
      analyzePlantDisease(
        imageBase64,
        mode,
        plantType,
        mode === 'image-and-env' ? envData : undefined,
        'taichu'
      ).catch(error => {
        console.error("Taichu-VL模型分析失败:", error);
        taichuError = error;
        toast.error("Taichu-VL模型分析失败，将仅使用智谱AI结果");
        return null;
      }),
      
      // 智谱AI模型
      analyzePlantDisease(
        imageBase64,
        mode,
        plantType,
        mode === 'image-and-env' ? envData : undefined,
        'zhipu'
      ).catch(error => {
        console.error("智谱AI模型分析失败:", error);
        zhipuError = error;
        toast.error("智谱AI模型分析失败，将仅使用Taichu-VL结果");
        return null;
      })
    ]);
    
    // 如果两个模型都失败，抛出组合错误
    if (!taichuResult && !zhipuResult) {
      const errorMessage = "所有模型分析都失败了";
      console.error(errorMessage, {taichuError, zhipuError});
      throw new Error(errorMessage);
    }
    
    // 如果只有一个模型成功，返回成功的那个结果
    if (!taichuResult) return zhipuResult!;
    if (!zhipuResult) return taichuResult;
    
    // 综合两个模型的结果
    return combineResults(taichuResult, zhipuResult);
  } catch (error) {
    console.error("多模型分析出错:", error);
    throw error;
  }
};

/**
 * 综合两个模型的分析结果
 */
function combineResults(result1: DiagnosisResult, result2: DiagnosisResult): DiagnosisResult {
  console.log("综合多个模型的分析结果");
  
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
  
  // 合并描述，选择更详细的描述
  const combinedDescription = 
    baseResult.description.length > secondaryResult.description.length 
      ? baseResult.description 
      : secondaryResult.description;
  
  // 智能合并处理方法
  const allTreatments = [...baseResult.treatments, ...secondaryResult.treatments];
  const uniqueMethods = new Set<string>();
  const combinedTreatments = allTreatments
    .filter(treatment => {
      // 检查是否已经添加了该方法
      if (uniqueMethods.has(treatment.method)) {
        return false;
      }
      uniqueMethods.add(treatment.method);
      return true;
    })
    .slice(0, 4); // 最多保留4种处理方法
  
  return {
    name: baseResult.name,
    description: combinedDescription,
    confidence: newConfidence,
    treatments: combinedTreatments
  };
}
