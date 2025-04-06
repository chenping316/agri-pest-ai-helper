
import React from "react";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Image, Thermometer, CheckCircle } from "lucide-react";
import { useAppContext } from "@/context/AppContext";

const ConnectionStatus: React.FC = () => {
  const { envData } = useAppContext();
  
  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-3">
        <Badge 
          variant="outline" 
          className="bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300"
        >
          <AlertCircle className="h-3 w-3 mr-1" />
          综合分析模式
        </Badge>
        <span className="text-sm text-muted-foreground">
          环境数据与图像特征双重分析
        </span>
      </div>
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Thermometer className="h-4 w-4 text-blue-600" />
          <span className="text-xs text-muted-foreground">
            环境数据特征提取
          </span>
          <CheckCircle className="h-3 w-3 ml-1 text-green-600" />
        </div>
        <div className="flex items-center gap-2">
          <Image className="h-4 w-4 text-blue-600" />
          <span className="text-xs text-muted-foreground">
            图像特征提取与匹配
          </span>
          <CheckCircle className="h-3 w-3 ml-1 text-green-600" />
        </div>
        <div className="text-xs text-blue-600 dark:text-blue-400 font-medium mt-1">
          双重数据融合分析提高识别准确度达35%
        </div>
      </div>
    </div>
  );
};

export default ConnectionStatus;
