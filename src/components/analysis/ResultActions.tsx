
import React from "react";
import { Button } from "@/components/ui/button";
import { Repeat, Search } from "lucide-react";
import { DiagnosisResult } from "@/types";
import { openBaiduSearch } from "@/utils/aiAnalysis";

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
  
  const handleSearchHelp = () => {
    openBaiduSearch("localhost API 连接问题 Node.js Express");
  };

  return (
    <div className="flex flex-col sm:flex-row gap-2">
      <Button onClick={resetAnalysis} variant="outline" className="flex-1">
        <Repeat className="w-4 h-4 mr-2" />
        重新分析
      </Button>
      
      {isNetworkError && (
        <Button onClick={handleSearchHelp} variant="secondary" className="flex-1">
          <Search className="w-4 h-4 mr-2" />
          搜索连接问题
        </Button>
      )}
    </div>
  );
};

export default ResultActions;
