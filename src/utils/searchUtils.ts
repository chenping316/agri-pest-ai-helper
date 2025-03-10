
/**
 * 搜索工具模块，集中管理所有搜索相关功能
 */

// 在百度中搜索
export const openBaiduSearch = (query: string) => {
  const encodedQuery = encodeURIComponent(query);
  window.open(`https://www.baidu.com/s?wd=${encodedQuery}`, '_blank');
};

// 应用内搜索功能（返回查询字符串）
export const performInAppSearch = (query: string): string => {
  return query;
};

// 搜索额外治疗方法
export const searchAdditionalTreatments = (diseaseName: string, plantType?: string): string => {
  const query = plantType 
    ? `${plantType} ${diseaseName} 治疗方法 Taichu-VL`
    : `${diseaseName} 治疗方法 Taichu-VL`;
  
  return query;
};

// 连接问题搜索
export const searchConnectionIssues = (): string => {
  return "Taichu-VL API 连接问题";
};

// 症状搜索
export const searchSymptoms = (diseaseName: string): string => {
  return `${diseaseName} 症状 特征 图片`;
};

// 治疗方法搜索
export const searchTreatmentMethod = (diseaseName: string, treatment: string): string => {
  return `${diseaseName} ${treatment} 详细步骤 使用方法`;
};

// 疾病一般搜索
export const searchDiseaseInfo = (diseaseName: string): string => {
  return `${diseaseName} 防治方法 最新技术`;
};
