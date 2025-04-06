
import React from "react";
import DiagnosisResult from "@/components/DiagnosisResult";
import { DiagnosisResult as DiagnosisResultType } from "@/types";
import AnalysisProgress from "./AnalysisProgress";
import ResultActions from "./ResultActions";
import ImagePreview from "./ImagePreview";
import { useAppContext } from "@/context/AppContext";
import { Thermometer, Image, ArrowRight, Zap } from "lucide-react";

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
  const { analysisMode } = useAppContext();
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border p-4">
      <h2 className="text-lg font-medium mb-4">分析结果</h2>
      
      {isAnalyzing ? (
        <>
          <AnalysisProgress analysisProgress={analysisProgress} />
          
          {analysisMode === "image-and-env" && (
            <div className="mt-6">
              <div className="text-sm font-medium mb-2">分析进行中</div>
              <div className="flex items-center justify-between">
                <div className="flex flex-col items-center">
                  <Image className="h-6 w-6 text-blue-500 mb-1" />
                  <div className="text-xs">图像特征</div>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
                <div className="flex flex-col items-center">
                  <Zap className="h-6 w-6 text-green-500 mb-1" />
                  <div className="text-xs">特征融合</div>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
                <div className="flex flex-col items-center">
                  <Thermometer className="h-6 w-6 text-blue-500 mb-1" />
                  <div className="text-xs">环境分析</div>
                </div>
              </div>
            </div>
          )}
        </>
      ) : diagnosisResult ? (
        <div className="space-y-4">
          <DiagnosisResult result={diagnosisResult} />
          <ResultActions resetAnalysis={resetAnalysis} diagnosisResult={diagnosisResult} />
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
