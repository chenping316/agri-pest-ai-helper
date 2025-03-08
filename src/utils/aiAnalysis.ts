
import { AnalysisMode, DiagnosisResult, EnvData } from "@/types";

// Mock API for diagnosing plant diseases
export const analyzePlantDisease = async (
  imageBase64: string,
  mode: AnalysisMode,
  envData?: EnvData
): Promise<DiagnosisResult> => {
  console.log(`Analyzing image with mode: ${mode}`);
  
  // In a real app, this would send the image to an AI model or API
  // Since this is a UI mock, we'll return random results
  const possibleDiseases = [
    {
      name: "稻瘟病",
      description: "稻瘟病是由稻瘟病菌引起的一种常见的水稻疾病，表现为叶片上的褐色病斑和花颈部变黑。",
      treatments: [
        {
          method: "喷洒杀菌剂",
          cost: "low",
          effectiveness: "high",
          estimatedPrice: "¥30-50/亩",
          description: "使用代森锰锌或苯菌灵等杀菌剂喷洒，每7-10天一次，连续2-3次。"
        },
        {
          method: "农业措施",
          cost: "low",
          effectiveness: "medium",
          estimatedPrice: "¥0-20/亩",
          description: "保持田间通风，适当控制氮肥使用量，增施钾肥。"
        }
      ]
    },
    {
      name: "蚜虫",
      description: "蚜虫是一种常见的农作物害虫，会吸食植物汁液，导致叶片卷曲，生长缓慢，并传播病毒。",
      treatments: [
        {
          method: "生物防治",
          cost: "low",
          effectiveness: "medium",
          estimatedPrice: "¥20-40/亩",
          description: "释放七星瓢虫或寄生蜂等天敌。"
        },
        {
          method: "化学防治",
          cost: "medium",
          effectiveness: "high",
          estimatedPrice: "¥40-60/亩",
          description: "使用吡虫啉或氯氰菊酯等农药喷洒，注意安全使用。"
        }
      ]
    },
    {
      name: "霜霉病",
      description: "霜霉病是由真菌引起的疾病，在叶片表面形成白色或灰色的霉状物，严重时导致叶片枯死。",
      treatments: [
        {
          method: "预防措施",
          cost: "low",
          effectiveness: "medium",
          estimatedPrice: "¥10-30/亩",
          description: "选用抗病品种，适当密植，合理灌溉。"
        },
        {
          method: "药剂防治",
          cost: "medium",
          effectiveness: "high",
          estimatedPrice: "¥50-70/亩",
          description: "喷洒甲霜灵或烯酰吗啉等药剂，每7-14天一次。"
        }
      ]
    },
    {
      name: "锈病",
      description: "锈病是由锈菌引起的植物疾病，表现为叶片上出现黄褐色或红褐色的小点状病斑。",
      treatments: [
        {
          method: "轮作",
          cost: "low",
          effectiveness: "medium",
          estimatedPrice: "¥0/亩",
          description: "实行2-3年轮作，避免连作。"
        },
        {
          method: "喷洒杀菌剂",
          cost: "medium",
          effectiveness: "high",
          estimatedPrice: "¥40-60/亩",
          description: "使用戊唑醇或嘧菌酯等杀菌剂喷洒，每10-14天一次。"
        }
      ]
    }
  ] as const;

  // Simulate analysis delay
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Randomly select a disease
  const randomDiseaseIndex = Math.floor(Math.random() * possibleDiseases.length);
  const selectedDisease = possibleDiseases[randomDiseaseIndex];
  
  // Sort treatments by cost (lowest first)
  const sortedTreatments = [...selectedDisease.treatments].sort((a, b) => {
    const costOrder = { low: 1, medium: 2, high: 3 };
    return costOrder[a.cost as keyof typeof costOrder] - costOrder[b.cost as keyof typeof costOrder];
  });
  
  // Generate result with confidence
  return {
    name: selectedDisease.name,
    description: selectedDisease.description,
    confidence: 0.7 + Math.random() * 0.25, // Random confidence between 70% and 95%
    treatments: sortedTreatments
  };
};

// Simulate calling an internet search API for treatment recommendations
export const searchTreatments = async (
  diseaseName: string
): Promise<any> => {
  console.log(`Searching treatments for: ${diseaseName}`);
  // This would be implemented with a real search API in a production app
  await new Promise(resolve => setTimeout(resolve, 1000));
  return null; // We're using mock data instead
};
