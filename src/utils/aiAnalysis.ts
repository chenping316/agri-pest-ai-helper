import { AnalysisMode, DiagnosisResult, EnvData } from "@/types";
import { analyzePlantDisease as taichuAnalyzePlantDisease } from "@/api/taichuVL/plantAnalysis";
import { analyzePlantDisease as chatGLMAnalyzePlantDisease } from "@/api/chatGLM/plantAnalysis";
import { analyzePlantDisease as sparkAnalyzePlantDisease } from "@/api/sparkAI/plantAnalysis";
import { analyzePlantDisease as qwenAnalyzePlantDisease, analyzeTextOnPlantImage as qwenOcrAnalyzePlantDisease } from "@/api/qwenVL/plantAnalysis";
import { toast } from "sonner";

/**
 * 定义分析模型类型
 */
export type AnalysisModelType = 'taichu' | 'zhipu' | 'spark' | 'qwen' | 'qwen-ocr' | 'multi' | 'super-multi';

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
    switch (modelType) {
      case 'zhipu':
        // 使用智谱AI模型 (GLM-4)
        return await chatGLMAnalyzePlantDisease(
          imageBase64,
          plantType,
          mode === 'image-and-env' ? envData : undefined
        );
      case 'spark':
        // 使用讯飞星火大模型
        return await sparkAnalyzePlantDisease(
          imageBase64,
          plantType,
          mode === 'image-and-env' ? envData : undefined
        );
      case 'qwen':
        // 使用通义千问大模型
        return await qwenAnalyzePlantDisease(
          imageBase64,
          plantType,
          mode === 'image-and-env' ? envData : undefined
        );
      case 'qwen-ocr':
        // 使用通义千问OCR大模型
        return await qwenOcrAnalyzePlantDisease(
          imageBase64,
          plantType,
          mode === 'image-and-env' ? envData : undefined
        );
      default:
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
  let sparkResult: DiagnosisResult | null = null;
  let sparkError: any = null;
  
  try {
    // 并行调用三个模型API以减少等待时间
    [taichuResult, zhipuResult, sparkResult] = await Promise.all([
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
        toast.error("Taichu-VL模型分析失败，将使用其他模型结果");
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
        toast.error("智谱AI模型分析失败，将使用其他模型结果");
        return null;
      }),
      
      // 讯飞星火模型
      analyzePlantDisease(
        imageBase64,
        mode,
        plantType,
        mode === 'image-and-env' ? envData : undefined,
        'spark'
      ).catch(error => {
        console.error("讯飞星火模型分析失败:", error);
        sparkError = error;
        toast.error("讯飞星火模型分析失败，将使用其他模型结果");
        return null;
      })
    ]);
    
    // 统计成功的模型数量
    const successfulResults = [taichuResult, zhipuResult, sparkResult].filter(Boolean);
    
    // 如果所有模型都失败，抛出组合错误
    if (successfulResults.length === 0) {
      const errorMessage = "所有模型分析都失败了";
      console.error(errorMessage, {taichuError, zhipuError, sparkError});
      throw new Error(errorMessage);
    }
    
    // 如果只有一个模型成功，返回成功的那个结果
    if (successfulResults.length === 1) {
      return successfulResults[0]!;
    }
    
    // 如果有两个模型成功，使用两个模型的结果
    if (successfulResults.length === 2) {
      return combineResults(successfulResults[0]!, successfulResults[1]!);
    }
    
    // 如果三个模型都成功，综合三个模型的结果
    return combineTripleResults(taichuResult!, zhipuResult!, sparkResult!);
  } catch (error) {
    console.error("多模型分析出错:", error);
    throw error;
  }
};

/**
 * 综合使用四个模型分析植物疾病的函数
 */
export const analyzeWithSuperMultipleModels = async (
  imageBase64: string,
  mode: AnalysisMode,
  plantType?: string,
  envData?: EnvData
): Promise<DiagnosisResult> => {
  console.log(`开始超级多模型分析，模式: ${mode}, 植物类型: ${plantType || '未指定'}`);
  
  // 定义模型分析结果和错误
  let taichuResult: DiagnosisResult | null = null;
  let taichuError: any = null;
  let zhipuResult: DiagnosisResult | null = null;
  let zhipuError: any = null;
  let sparkResult: DiagnosisResult | null = null;
  let sparkError: any = null;
  let qwenResult: DiagnosisResult | null = null;
  let qwenError: any = null;
  
  try {
    // 并行调用四个模型API以减少等待时间
    [taichuResult, zhipuResult, sparkResult, qwenResult] = await Promise.all([
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
        toast.error("Taichu-VL模型分析失败，将使用其他模型结果");
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
        toast.error("智谱AI模型分析失败，将使用其他模型结果");
        return null;
      }),
      
      // 讯飞星火模型
      analyzePlantDisease(
        imageBase64,
        mode,
        plantType,
        mode === 'image-and-env' ? envData : undefined,
        'spark'
      ).catch(error => {
        console.error("讯飞星火模型分析失败:", error);
        sparkError = error;
        toast.error("讯飞星火模型分析失败，将使用其他模型结果");
        return null;
      }),
      
      // 通义千问模型
      analyzePlantDisease(
        imageBase64,
        mode,
        plantType,
        mode === 'image-and-env' ? envData : undefined,
        'qwen'
      ).catch(error => {
        console.error("通义千问模型分析失败:", error);
        qwenError = error;
        toast.error("通义千问模型分析失败，将使用其他模型结果");
        return null;
      })
    ]);
    
    // 统计成功的模型数量
    const successfulResults = [taichuResult, zhipuResult, sparkResult, qwenResult].filter(Boolean);
    
    // 如果所有模型都失败，抛出组合错误
    if (successfulResults.length === 0) {
      const errorMessage = "所有模型分析都失败了";
      console.error(errorMessage, {taichuError, zhipuError, sparkError, qwenError});
      throw new Error(errorMessage);
    }
    
    // 如果只有一个模型成功，返回成功的那个结果
    if (successfulResults.length === 1) {
      return successfulResults[0]!;
    }
    
    // 如果有2或3个模型成功，使用combineMultiResults函数
    if (successfulResults.length < 4) {
      return combineMultiResults(successfulResults);
    }
    
    // 如果四个模型都成功，综合四个模型的结果
    return combineQuadrupleResults(taichuResult!, zhipuResult!, sparkResult!, qwenResult!);
  } catch (error) {
    console.error("超级多模型分析出错:", error);
    throw error;
  }
};

/**
 * 综合使用五种模型分析植物疾病的函数（包括OCR模型）
 */
export const analyzeWithUltraMultipleModels = async (
  imageBase64: string,
  mode: AnalysisMode,
  plantType?: string,
  envData?: EnvData
): Promise<DiagnosisResult> => {
  console.log(`开始超级多模型分析（含OCR），模式: ${mode}, 植物类型: ${plantType || '未指定'}`);
  
  // 定义模型分析结果和错误
  let taichuResult: DiagnosisResult | null = null;
  let taichuError: any = null;
  let zhipuResult: DiagnosisResult | null = null;
  let zhipuError: any = null;
  let sparkResult: DiagnosisResult | null = null;
  let sparkError: any = null;
  let qwenResult: DiagnosisResult | null = null;
  let qwenError: any = null;
  let qwenOcrResult: DiagnosisResult | null = null;
  let qwenOcrError: any = null;
  
  try {
    // 并行调用五个模型API以减少等待时间
    [taichuResult, zhipuResult, sparkResult, qwenResult, qwenOcrResult] = await Promise.all([
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
        toast.error("Taichu-VL模型分析失败，将使用其他模型结果");
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
        toast.error("智谱AI模型分析失败，将使用其他模型结果");
        return null;
      }),
      
      // 讯飞星火模型
      analyzePlantDisease(
        imageBase64,
        mode,
        plantType,
        mode === 'image-and-env' ? envData : undefined,
        'spark'
      ).catch(error => {
        console.error("讯飞星火模型分析失败:", error);
        sparkError = error;
        toast.error("讯飞星火模型分析失败，将使用其他模型结果");
        return null;
      }),
      
      // 通义千问模型
      analyzePlantDisease(
        imageBase64,
        mode,
        plantType,
        mode === 'image-and-env' ? envData : undefined,
        'qwen'
      ).catch(error => {
        console.error("通义千问模型分析失败:", error);
        qwenError = error;
        toast.error("通义千问模型分析失败，将使用其他模型结果");
        return null;
      }),
      
      // 通义千问OCR模型
      analyzePlantDisease(
        imageBase64,
        mode,
        plantType,
        mode === 'image-and-env' ? envData : undefined,
        'qwen-ocr'
      ).catch(error => {
        console.error("通义千问OCR模型分析失败:", error);
        qwenOcrError = error;
        toast.error("通义千问OCR模型分析失败，将使用其他模型结果");
        return null;
      })
    ]);
    
    // 统计成功的模型数量
    const successfulResults = [taichuResult, zhipuResult, sparkResult, qwenResult, qwenOcrResult].filter(Boolean);
    
    // 如果所有模型都失败，抛出组合错误
    if (successfulResults.length === 0) {
      const errorMessage = "所有模型分析都失败了";
      console.error(errorMessage, {taichuError, zhipuError, sparkError, qwenError, qwenOcrError});
      throw new Error(errorMessage);
    }
    
    // 如果只有一个模型成功，返回成功的那个结果
    if (successfulResults.length === 1) {
      return successfulResults[0]!;
    }
    
    // 使用combineMultiResults函数处理多个结果
    return combineMultiResults(successfulResults);
  } catch (error) {
    console.error("超级多模型（含OCR）分析出错:", error);
    throw error;
  }
};

/**
 * 综合两个模型的分析结果
 */
function combineResults(result1: DiagnosisResult, result2: DiagnosisResult): DiagnosisResult {
  console.log("综合两个模型的分析结果");
  
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

/**
 * 综合三个模型的分析结果
 */
function combineTripleResults(
  result1: DiagnosisResult, 
  result2: DiagnosisResult, 
  result3: DiagnosisResult
): DiagnosisResult {
  console.log("综合三个模型的分析结果");
  
  // 创建疾病名称的映射，进行归一化处理
  const diseaseNames = [result1.name, result2.name, result3.name];
  
  // 统计每个疾病名称出现的次数
  const nameCounts: Record<string, {count: number, confidence: number, results: DiagnosisResult[]}> = {};
  
  [result1, result2, result3].forEach(result => {
    if (!nameCounts[result.name]) {
      nameCounts[result.name] = {count: 0, confidence: 0, results: []};
    }
    nameCounts[result.name].count++;
    nameCounts[result.name].confidence += result.confidence;
    nameCounts[result.name].results.push(result);
  });
  
  // 找出出现次数最多的疾病名称
  let maxCount = 0;
  let maxConfidence = 0;
  let mostLikelyDiseaseName = '';
  
  for (const [diseaseName, data] of Object.entries(nameCounts)) {
    // 优先考虑出现次数，如果次数相同则考虑置信度总和
    if (data.count > maxCount || (data.count === maxCount && data.confidence > maxConfidence)) {
      maxCount = data.count;
      maxConfidence = data.confidence;
      mostLikelyDiseaseName = diseaseName;
    }
  }
  
  // 获取关联结果
  const relatedResults = nameCounts[mostLikelyDiseaseName].results;
  
  // 计算新的置信度 - 考虑到一致性和每个模型的置信度
  let newConfidence = relatedResults.reduce((sum, result) => sum + result.confidence, 0) / relatedResults.length;
  
  // 根据模型一致性调整置信度
  const totalModels = 3;
  const consensusModels = maxCount;
  const consensusRatio = consensusModels / totalModels;
  
  // 提高置信度，根据一致性程度
  if (consensusRatio === 1) {
    // 完全一致
    newConfidence = Math.min(1, newConfidence + 0.15);
  } else if (consensusRatio >= 0.75) {
    // 75%以上一致
    newConfidence = Math.min(1, newConfidence + 0.10);
  } else if (consensusRatio >= 0.5) {
    // 50%以上一致
    newConfidence = Math.min(1, newConfidence + 0.05);
  }
  
  // 找出最详细的描述
  const descriptions = relatedResults.map(result => result.description);
  const mostDetailedDescription = descriptions.reduce(
    (longest, current) => current.length > longest.length ? current : longest,
    ""
  );
  
  // 合并所有处理方法
  const allTreatments = relatedResults.flatMap(result => result.treatments);
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
    name: mostLikelyDiseaseName,
    description: mostDetailedDescription,
    confidence: newConfidence,
    treatments: combinedTreatments
  };
}

/**
 * 综合多个模型的分析结果
 */
function combineMultiResults(results: DiagnosisResult[]): DiagnosisResult {
  console.log(`综合${results.length}个模型的分析结果`);
  
  // 创建疾病名称的映射，进行归一化处理
  const diseaseNames = results.map(result => result.name);
  
  // 统计每个疾病名称出现的次数
  const nameCounts: Record<string, {count: number, confidence: number, results: DiagnosisResult[]}> = {};
  
  results.forEach(result => {
    if (!nameCounts[result.name]) {
      nameCounts[result.name] = {count: 0, confidence: 0, results: []};
    }
    nameCounts[result.name].count++;
    nameCounts[result.name].confidence += result.confidence;
    nameCounts[result.name].results.push(result);
  });
  
  // 找出出现次数最多的疾病名称
  let maxCount = 0;
  let maxConfidence = 0;
  let mostLikelyDiseaseName = '';
  
  for (const [diseaseName, data] of Object.entries(nameCounts)) {
    // 优先考虑出现次数，如果次数相同则考虑置信度总和
    if (data.count > maxCount || (data.count === maxCount && data.confidence > maxConfidence)) {
      maxCount = data.count;
      maxConfidence = data.confidence;
      mostLikelyDiseaseName = diseaseName;
    }
  }
  
  // 获取关联结果
  const relatedResults = nameCounts[mostLikelyDiseaseName].results;
  
  // 计算新的置信度 - 考虑到一致性和每个模型的置信度
  let newConfidence = relatedResults.reduce((sum, result) => sum + result.confidence, 0) / relatedResults.length;
  
  // 根据模型一致性调整置信度
  const totalModels = results.length;
  const consensusModels = maxCount;
  const consensusRatio = consensusModels / totalModels;
  
  // 提高置信度，根据一致性程度
  if (consensusRatio === 1) {
    // 完全一致
    newConfidence = Math.min(1, newConfidence + 0.15);
  } else if (consensusRatio >= 0.75) {
    // 75%以上一致
    newConfidence = Math.min(1, newConfidence + 0.10);
  } else if (consensusRatio >= 0.5) {
    // 50%以上一致
    newConfidence = Math.min(1, newConfidence + 0.05);
  }
  
  // 找出最详细的描述
  const descriptions = relatedResults.map(result => result.description);
  const mostDetailedDescription = descriptions.reduce(
    (longest, current) => current.length > longest.length ? current : longest,
    ""
  );
  
  // 合并所有处理方法
  const allTreatments = relatedResults.flatMap(result => result.treatments);
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
    name: mostLikelyDiseaseName,
    description: mostDetailedDescription,
    confidence: newConfidence,
    treatments: combinedTreatments
  };
}

/**
 * 综合四个模型的分析结果
 */
function combineQuadrupleResults(
  result1: DiagnosisResult, 
  result2: DiagnosisResult, 
  result3: DiagnosisResult,
  result4: DiagnosisResult
): DiagnosisResult {
  console.log("综合四个模型的分析结果");
  return combineMultiResults([result1, result2, result3, result4]);
}
