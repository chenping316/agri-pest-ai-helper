
import React from "react";
import DiagnosisResult from "@/components/DiagnosisResult";
import { DiagnosisResult as DiagnosisResultType } from "@/types";
import AnalysisProgress from "./AnalysisProgress";
import ResultActions from "./ResultActions";
import ImagePreview from "./ImagePreview";

interface AnalysisOutputProps {
  isAnalyzing: boolean;
  analysisProgress: number;
  diagnosisResult: DiagnosisResultType | null;
  capturedImage: string | null;
  resetAnalysis: () => void;
  performAnalysis: () => void;
}

const AnalysisOutput: React.FC<AnalysisOutputProps> = ({
  isAnalyzing,
  analysisProgress,
  diagnosisResult,
  capturedImage,
  resetAnalysis,
  performAnalysis,
}) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border p-4">
      <h2 className="text-lg font-medium mb-4">分析结果</h2>
      
      {isAnalyzing ? (
        <AnalysisProgress analysisProgress={analysisProgress} />
      ) : diagnosisResult ? (
        <div className="space-y-4">
          <DiagnosisResult result={diagnosisResult} />
          <ResultActions resetAnalysis={resetAnalysis} />
        </div>
      ) : (
        <ImagePreview
          capturedImage={capturedImage}
          resetAnalysis={resetAnalysis}
          performAnalysis={performAnalysis}
        />
      )}
    </div>
  );
};

export default AnalysisOutput;
