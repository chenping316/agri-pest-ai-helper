
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Wifi, WifiOff, AlertCircle } from "lucide-react";
import { useAppContext } from "@/context/AppContext";

interface ConnectionStatusProps {
  isBluetoothConnected: boolean;
}

const ConnectionStatus: React.FC<ConnectionStatusProps> = ({
  isBluetoothConnected,
}) => {
  const { bluetoothDevices, manualEnvDataMode } = useAppContext();
  
  // Check if there's a qiongshuAI device in the list
  const qiongshuDevice = bluetoothDevices.find(device => device.name.includes("qiongshuAI"));
  const qiongshuConnected = qiongshuDevice?.connected || false;
  
  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-3">
        <Badge 
          variant="outline" 
          className={
            manualEnvDataMode ? "bg-blue-100 text-blue-800" :
            isBluetoothConnected ? 
              qiongshuConnected ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"
            : "bg-red-100 text-red-800"
          }
        >
          {manualEnvDataMode ? (
            <>
              <AlertCircle className="h-3 w-3 mr-1" />
              手动输入模式
            </>
          ) : isBluetoothConnected ? (
            <>
              <Wifi className="h-3 w-3 mr-1 animate-pulse-green" />
              {qiongshuConnected ? "已连接青书AI设备" : "已连接普通设备"}
            </>
          ) : (
            <>
              <WifiOff className="h-3 w-3 mr-1" />
              未连接设备
            </>
          )}
        </Badge>
        <span className="text-sm text-muted-foreground">
          {manualEnvDataMode ? (
            "使用手动输入的环境数据进行分析"
          ) : isBluetoothConnected ? (
            qiongshuConnected ? 
              "青书AI专用设备已连接，环境数据已准备就绪" : 
              "设备已连接，但推荐使用青书AI专用设备获取更精准的数据"
          ) : (
            "请连接蓝牙设备以采集环境数据，推荐使用青书AI专用设备"
          )}
        </span>
      </div>
      
      {!isBluetoothConnected && !manualEnvDataMode && (
        <div className="text-sm bg-amber-50 border border-amber-200 rounded p-3 text-amber-800 dark:bg-amber-900/20 dark:border-amber-800 dark:text-amber-300">
          <p className="flex items-center">
            <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" />
            无法检测到青书AI设备，请打开蓝牙并重新连接，或者启用手动输入模式。
          </p>
        </div>
      )}
    </div>
  );
};

export default ConnectionStatus;
