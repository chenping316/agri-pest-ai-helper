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
        },
        {
          method: "水稻品种改良",
          cost: "medium",
          effectiveness: "high",
          estimatedPrice: "¥50-100/亩",
          description: "选用抗稻瘟病品种，可显著减少病害发生。"
        },
        {
          method: "生物防治",
          cost: "medium",
          effectiveness: "medium",
          estimatedPrice: "¥40-60/亩",
          description: "使用枯草芽孢杆菌等微生物制剂，抑制病原菌生长。"
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
        },
        {
          method: "物理防治",
          cost: "low",
          effectiveness: "low",
          estimatedPrice: "¥10-30/亩",
          description: "使用黄色粘虫板诱捕蚜虫，适用于小面积种植。"
        },
        {
          method: "种植驱虫植物",
          cost: "low",
          effectiveness: "medium",
          estimatedPrice: "¥15-35/亩",
          description: "间作种植大蒜、万寿菊等具有驱虫作用的植物。"
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
        },
        {
          method: "土壤处理",
          cost: "medium",
          effectiveness: "medium",
          estimatedPrice: "¥40-60/亩",
          description: "使用石灰或硫磺粉改良土壤酸碱度，创造不利于病菌生存的环境。"
        },
        {
          method: "生态控制",
          cost: "high",
          effectiveness: "high",
          estimatedPrice: "¥70-100/亩",
          description: "使用塑料薄膜覆盖，进行土壤太阳能消毒，杀灭土壤中的病原菌。"
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
        },
        {
          method: "抗病栽培",
          cost: "medium",
          effectiveness: "high",
          estimatedPrice: "¥30-50/亩",
          description: "选用抗锈病品种，增强植物抵抗力。"
        },
        {
          method: "营养调控",
          cost: "low",
          effectiveness: "medium",
          estimatedPrice: "¥20-40/亩",
          description: "合理施肥，增加钾肥用量，提高植物抗病能力。"
        }
      ]
    },
    {
      name: "白粉病",
      description: "白粉病是由子囊菌引起的植物病害，表现为叶片、茎和花上出现白色粉状物，严重影响光合作用。",
      treatments: [
        {
          method: "有机杀菌剂",
          cost: "low",
          effectiveness: "medium",
          estimatedPrice: "¥25-45/亩",
          description: "喷洒碳酸氢钾或硫磺制剂，对环境友好且成本较低。"
        },
        {
          method: "化学杀菌剂",
          cost: "medium",
          effectiveness: "high",
          estimatedPrice: "¥50-70/亩",
          description: "使用三唑类杀菌剂或嘧菌酯等喷洒，效果显著。"
        },
        {
          method: "通风管理",
          cost: "low",
          effectiveness: "medium",
          estimatedPrice: "¥10-30/亩",
          description: "改善通风条件，减少湿度，合理密植，创造不利于病菌繁殖的环境。"
        },
        {
          method: "生物防治",
          cost: "medium",
          effectiveness: "medium",
          estimatedPrice: "¥35-55/亩",
          description: "使用寄生真菌或拮抗微生物制剂，抑制白粉病菌的生长。"
        }
      ]
    }
  ] as const;

  // Simulate analysis delay
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // AI model enhanced selection based on mode
  // Using environment data when available improves accuracy
  let randomDiseaseIndex = 0;
  
  if (mode === 'image-and-env' && envData) {
    // In a real app, this would use a more sophisticated algorithm
    // For now, we'll use a deterministic approach based on env data
    const soilMoistureThreshold = 60;
    const soilPhThreshold = 6.5;
    
    if (envData.soilMoisture > soilMoistureThreshold && envData.soilPh < soilPhThreshold) {
      // High moisture and acidic soil often leads to fungal diseases
      randomDiseaseIndex = 0; // 稻瘟病 (fungal disease)
    } else if (envData.airTemperature > 25 && envData.airHumidity < 50) {
      // Hot and dry conditions often lead to insect pests
      randomDiseaseIndex = 1; // 蚜虫 (aphids)
    } else if (envData.soilMoisture > soilMoistureThreshold && envData.airHumidity > 70) {
      // High moisture and humidity often leads to mildew diseases
      randomDiseaseIndex = 2; // 霜霉病 (downy mildew)
    } else {
      // Other conditions
      randomDiseaseIndex = Math.min(3 + Math.floor(Math.random() * 2), possibleDiseases.length - 1);
    }
  } else {
    // Image-only mode uses a more basic approach
    randomDiseaseIndex = Math.floor(Math.random() * possibleDiseases.length);
  }
  
  const selectedDisease = possibleDiseases[randomDiseaseIndex];
  
  // Sort treatments by cost (lowest first)
  const sortedTreatments = [...selectedDisease.treatments].sort((a, b) => {
    const costOrder = { low: 1, medium: 2, high: 3 };
    return costOrder[a.cost as keyof typeof costOrder] - costOrder[b.cost as keyof typeof costOrder];
  });
  
  // Generate result with 100% confidence
  return {
    name: selectedDisease.name,
    description: selectedDisease.description,
    confidence: 1.0, // 100% confidence
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
