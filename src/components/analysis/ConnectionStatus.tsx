
import React from "react";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Image, Thermometer } from "lucide-react";
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
          手动环境数据模式
        </Badge>
        <span className="text-sm text-muted-foreground">
          通过环境数据结合图片进行分析
        </span>
      </div>
      <div className="flex items-center gap-2">
        <Thermometer className="h-4 w-4 text-blue-600" />
        <span className="text-xs text-muted-foreground">
          数据分析将提高识别准确度
        </span>
        <Image className="h-4 w-4 ml-2 text-blue-600" />
        <span className="text-xs text-muted-foreground">
          结合图片特征进行综合判断
        </span>
      </div>
    </div>
  );
};

export default ConnectionStatus;
