
import { AnalysisMode, DiagnosisResult, EnvData } from "@/types";
import { analyzePlantDisease as apiAnalyzePlantDisease } from "@/api/taichuVL/plantAnalysis";

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
