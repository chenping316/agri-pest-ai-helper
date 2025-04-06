
import React from "react";
import { Search, Thermometer, Image, Zap } from "lucide-react";
import { AnalysisMode } from "@/types";

interface InfoMessagesProps {
  analysisMode: AnalysisMode;
}

const InfoMessages: React.FC<InfoMessagesProps> = ({
  analysisMode,
}) => {
  return (
    <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
      <h3 className="text-blue-800 dark:text-blue-200 font-medium flex items-center gap-1 mb-1">
        <Search className="h-4 w-4" />
        病虫害信息搜索功能
      </h3>
      <p className="text-sm text-blue-700 dark:text-blue-300">
        {analysisMode === "image-and-env" ? 
          "通过环境数据与图像特征融合分析，大幅提升病虫害识别准确度。系统会同时分析环境参数和图像特征，进行多维度交叉验证，排除干扰因素。" : 
          "分析完成后，您可以点击结果中的\"查看详情\"、\"查看详细步骤\"或\"搜索更多防治方法\"按钮获取更全面的信息和防治建议。"
        }
      </p>
      {analysisMode === "image-and-env" && (
        <div className="mt-3 space-y-2">
          <div className="flex items-center text-xs text-blue-600 dark:text-blue-400">
            <Thermometer className="h-3.5 w-3.5 mr-1" />
            <span className="mr-3">环境参数分析</span>
            <span className="text-xs text-gray-500">土壤湿度、温度、pH值影响</span>
          </div>
          <div className="flex items-center text-xs text-blue-600 dark:text-blue-400">
            <Image className="h-3.5 w-3.5 mr-1" />
            <span className="mr-3">图像特征识别</span>
            <span className="text-xs text-gray-500">叶片、茎干、果实症状特征</span>
          </div>
          <div className="flex items-center text-xs text-green-600 dark:text-green-400 font-medium">
            <Zap className="h-3.5 w-3.5 mr-1" />
            <span>数据融合分析大幅提升准确率</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default InfoMessages;
