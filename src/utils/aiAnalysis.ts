
import { AnalysisMode, DiagnosisResult, EnvData } from "@/types";
import { analyzePlantDisease as apiAnalyzePlantDisease } from "@/api/taichuVL/plantAnalysis";

// Function to open Baidu search in a new tab
export const openBaiduSearch = (query: string) => {
  const encodedQuery = encodeURIComponent(query);
  window.open(`https://www.baidu.com/s?wd=${encodedQuery}`, '_blank');
};

// Function to search within the app (returns the query string)
export const performInAppSearch = (query: string): string => {
  return query;
};

// Function to analyze plant diseases using API
export const analyzePlantDisease = async (
  imageBase64: string,
  mode: AnalysisMode,
  plantType?: string,
  envData?: EnvData
): Promise<DiagnosisResult> => {
  console.log(`Analyzing image with mode: ${mode}, plant type: ${plantType || 'not specified'}`);
  
  try {
    // Call the API client to analyze the image
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

// Function to search for additional treatments
export const searchAdditionalTreatments = (diseaseName: string, plantType?: string): string => {
  const query = plantType 
    ? `${plantType} ${diseaseName} 治疗方法 Taichu-VL`
    : `${diseaseName} 治疗方法 Taichu-VL`;
  
  return query;
};
