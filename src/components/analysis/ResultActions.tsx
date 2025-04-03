
import React from "react";
import { Button } from "@/components/ui/button";
import { ExternalLink, Repeat, Search, Cpu } from "lucide-react";
import { DiagnosisResult } from "@/types";
import { openBaiduSearch, searchAdditionalTreatments, searchConnectionIssues } from "@/utils/searchUtils";
import { Badge } from "@/components/ui/badge";

interface ResultActionsProps {
  resetAnalysis: () => void;
  diagnosisResult?: DiagnosisResult;
}

const ResultActions: React.FC<ResultActionsProps> = ({
  resetAnalysis,
  diagnosisResult
}) => {
  // Check if this is a network error result (very low confidence indicates fallback)
  const isNetworkError = diagnosisResult && diagnosisResult.confidence <= 0.05;
  
  // 确定分析使用的模型来源（从置信度和名称可以推断）
  const getModelSource = () => {
    if (!diagnosisResult) return null;
    
    if (isNetworkError) {
      if (diagnosisResult.name.includes("智谱AI")) return "智谱AI (GLM-4)";
      if (diagnosisResult.name.includes("讯飞星火")) return "讯飞星火";
      if (diagnosisResult.name.includes("Llama Vision")) return "Llama Vision";
      if (diagnosisResult.name.includes("通义千问")) return "通义千问";
      return "Taichu-VL";
    }
    
    // 根据置信度精确值判断是否为多模型分析
    // 多模型分析会对置信度进行调整，例如取平均值加0.1或0.15
    const confidence = diagnosisResult.confidence;
    
    // 检查是否来自多模型分析
    const isMultiModel = confidence.toString().length > 3 && 
                          !confidence.toString().endsWith("0");
                         
    if (isMultiModel) {
      if (confidence > 0.95) return "六模型混合";
      if (confidence > 0.9) return "五模型混合";
      if (confidence > 0.85) return "四模型混合";
      if (confidence > 0.8) return "三模型混合";
      if (confidence > 0.6) return "双模型混合";
    }
    
    if (diagnosisResult.name.includes("智谱AI")) return "智谱AI (GLM-4)";
    if (diagnosisResult.name.includes("讯飞星火")) return "讯飞星火";
    if (diagnosisResult.name.includes("Llama Vision")) return "Llama Vision";
    if (diagnosisResult.name.includes("通义千问OCR")) return "通义千问OCR";
    if (diagnosisResult.name.includes("通义千问")) return "通义千问";
    return "Taichu-VL";
  };
  
  const modelSource = getModelSource();
  
  const handleSearchHelp = () => {
    if (isNetworkError) {
      openBaiduSearch(searchConnectionIssues());
    } else if (diagnosisResult) {
      const query = searchAdditionalTreatments(
        diagnosisResult.name, 
        // Adding plantType if available in the future
      );
      openBaiduSearch(query);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col sm:flex-row gap-2">
        <Button onClick={resetAnalysis} variant="outline" className="flex-1">
          <Repeat className="w-4 h-4 mr-2" />
          重新分析
        </Button>
        
        {isNetworkError ? (
          <Button onClick={handleSearchHelp} variant="secondary" className="flex-1">
            <Search className="w-4 h-4 mr-2" />
            搜索连接问题
          </Button>
        ) : diagnosisResult && (
          <Button onClick={handleSearchHelp} variant="secondary" className="flex-1">
            <ExternalLink className="w-4 h-4 mr-2" />
            搜索更多治疗方法
          </Button>
        )}
      </div>
      
      {modelSource && (
        <div className="flex justify-end">
          <Badge variant="outline" className="flex items-center gap-1">
            <Cpu className="h-3 w-3" />
            <span className="text-xs">分析模型: {modelSource}</span>
          </Badge>
        </div>
      )}
    </div>
  );
};

export default ResultActions;
