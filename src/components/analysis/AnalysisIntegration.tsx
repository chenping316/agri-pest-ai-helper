
import React from "react";
import { Zap, Thermometer, Image, ArrowRight } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAppContext } from "@/context/AppContext";
import { AnalysisMode } from "@/types";

interface AnalysisIntegrationProps {
  analysisMode: AnalysisMode;
}

const AnalysisIntegration: React.FC<AnalysisIntegrationProps> = ({ analysisMode }) => {
  const { envData } = useAppContext();
  
  if (analysisMode !== "image-and-env") {
    return null;
  }
  
  return (
    <Card className="mb-6">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center">
          <Zap className="h-4 w-4 mr-2 text-blue-600" />
          双重分析技术
        </CardTitle>
        <CardDescription>图像与环境数据融合分析</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between mb-4">
          <div className="flex-1 flex flex-col items-center p-3 border rounded-lg bg-blue-50 dark:bg-blue-900/20">
            <Image className="h-8 w-8 text-blue-700 mb-2" />
            <div className="text-xs font-medium text-center">图像特征分析</div>
            <div className="text-[10px] text-muted-foreground text-center mt-1">形态学特征提取</div>
          </div>
          <ArrowRight className="h-5 w-5 text-muted-foreground mx-2" />
          <div className="flex-1 flex flex-col items-center p-3 border rounded-lg bg-green-50 dark:bg-green-900/20">
            <Zap className="h-8 w-8 text-green-700 mb-2" />
            <div className="text-xs font-medium text-center">融合分析算法</div>
            <div className="text-[10px] text-muted-foreground text-center mt-1">多维数据交叉验证</div>
          </div>
          <ArrowRight className="h-5 w-5 text-muted-foreground mx-2" />
          <div className="flex-1 flex flex-col items-center p-3 border rounded-lg bg-blue-50 dark:bg-blue-900/20">
            <Thermometer className="h-8 w-8 text-blue-700 mb-2" />
            <div className="text-xs font-medium text-center">环境参数分析</div>
            <div className="text-[10px] text-muted-foreground text-center mt-1">环境影响因子</div>
          </div>
        </div>
        <div className="text-xs text-center text-muted-foreground">
          通过将环境数据和图像特征结合分析，系统准确识别易混淆的病害类型
        </div>
      </CardContent>
    </Card>
  );
};

export default AnalysisIntegration;
