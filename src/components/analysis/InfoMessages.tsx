
import React from "react";
import { Search } from "lucide-react";
import { AnalysisMode } from "@/types";

interface InfoMessagesProps {
  analysisMode: AnalysisMode;
  isBluetoothConnected: boolean;
}

const InfoMessages: React.FC<InfoMessagesProps> = ({
  analysisMode,
  isBluetoothConnected,
}) => {
  return (
    <>
      {analysisMode === "image-and-env" && !isBluetoothConnected && (
        <div className="mt-6 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
          <h3 className="text-amber-800 dark:text-amber-200 font-medium mb-1">提示</h3>
          <p className="text-sm text-amber-700 dark:text-amber-300">
            您选择了图片 + 环境数据分析模式，但未连接蓝牙设备。环境数据能够提高分析准确性，建议连接设备后再进行分析。
          </p>
        </div>
      )}
      
      <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <h3 className="text-blue-800 dark:text-blue-200 font-medium flex items-center gap-1 mb-1">
          <Search className="h-4 w-4" />
          病虫害信息搜索功能
        </h3>
        <p className="text-sm text-blue-700 dark:text-blue-300">
          分析完成后，您可以点击结果中的"查看详情"、"查看详细步骤"或"搜索更多防治方法"按钮获取更全面的信息和防治建议。
        </p>
      </div>
    </>
  );
};

export default InfoMessages;
