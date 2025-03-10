
import React from "react";
import { Button } from "@/components/ui/button";
import { ExternalLink, Repeat, Search } from "lucide-react";
import { DiagnosisResult } from "@/types";
import { openBaiduSearch, searchAdditionalTreatments, searchConnectionIssues } from "@/utils/searchUtils";

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
  );
};

export default ResultActions;
