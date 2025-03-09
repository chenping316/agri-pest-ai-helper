
import React from "react";
import { Loader2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface AnalysisProgressProps {
  analysisProgress: number;
}

const AnalysisProgress: React.FC<AnalysisProgressProps> = ({
  analysisProgress,
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <Loader2 className="h-8 w-8 text-primary animate-spin mb-4" />
      <p className="text-muted-foreground mb-4">正在分析中，请稍候...</p>
      <div className="w-full max-w-xs">
        <Progress value={analysisProgress} className="h-2" />
      </div>
    </div>
  );
};

export default AnalysisProgress;
