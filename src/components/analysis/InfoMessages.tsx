
import React from "react";
import { Search, Thermometer, Image } from "lucide-react";
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
          "通过环境数据结合图片进行分析，可以提高病虫害识别的准确度。分析完成后，您可以点击结果中的相关按钮获取更全面的信息和防治建议。" : 
          "分析完成后，您可以点击结果中的\"查看详情\"、\"查看详细步骤\"或\"搜索更多防治方法\"按钮获取更全面的信息和防治建议。"
        }
      </p>
      {analysisMode === "image-and-env" && (
        <div className="mt-2 flex items-center text-xs text-blue-600 dark:text-blue-400">
          <Thermometer className="h-3.5 w-3.5 mr-1" />
          <span className="mr-3">环境数据</span>
          <Image className="h-3.5 w-3.5 mr-1" />
          <span>图片分析</span>
        </div>
      )}
    </div>
  );
};

export default InfoMessages;
