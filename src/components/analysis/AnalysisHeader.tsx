
import React from "react";
import { Bug, Image, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AnalysisMode } from "@/types";

interface AnalysisHeaderProps {
  analysisMode: AnalysisMode;
  setAnalysisMode: (mode: AnalysisMode) => void;
}

const AnalysisHeader: React.FC<AnalysisHeaderProps> = ({
  analysisMode,
  setAnalysisMode,
}) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Bug className="h-6 w-6 text-primary" />
          病虫害分析
        </h1>
        <p className="text-muted-foreground">拍摄或上传植物照片进行分析</p>
      </div>
      
      <div className="flex gap-2">
        <Button
          variant={analysisMode === "image-only" ? "default" : "outline"}
          size="sm"
          onClick={() => setAnalysisMode("image-only")}
          className={analysisMode === "image-only" ? "" : "text-muted-foreground"}
        >
          <Image className="h-4 w-4 mr-2" />
          仅图片分析
        </Button>
        <Button
          variant={analysisMode === "image-and-env" ? "default" : "outline"}
          size="sm"
          onClick={() => setAnalysisMode("image-and-env")}
          className={analysisMode === "image-and-env" ? "" : "text-muted-foreground"}
        >
          <Smartphone className="h-4 w-4 mr-2" />
          图片 + 环境数据
        </Button>
      </div>
    </div>
  );
};

export default AnalysisHeader;
