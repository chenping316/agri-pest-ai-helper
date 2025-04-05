
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Wifi, WifiOff, AlertCircle, Bluetooth, BluetoothOff } from "lucide-react";
import { useAppContext } from "@/context/AppContext";

interface ConnectionStatusProps {
  isBluetoothConnected: boolean;
}

const ConnectionStatus: React.FC<ConnectionStatusProps> = ({
  isBluetoothConnected,
}) => {
  const { bluetoothDevices, manualEnvDataMode, bluetoothState } = useAppContext();
  
  // Check if there's a qiongshuAI device in the list
  const qiongshuDevice = bluetoothDevices.find(device => 
    device.name.includes("qiongshuAI") && device.connected
  );
  
  const qiongshuConnected = !!qiongshuDevice;
  
  const getStatusIcon = () => {
    if (manualEnvDataMode) {
      return <AlertCircle className="h-3 w-3 mr-1" />;
    } else if (isBluetoothConnected) {
      return <Wifi className="h-3 w-3 mr-1 animate-pulse" />;
    } else if (bluetoothState === 'disabled') {
      return <BluetoothOff className="h-3 w-3 mr-1" />;
    } else {
      return <WifiOff className="h-3 w-3 mr-1" />;
    }
  };
  
  const getStatusText = () => {
    if (manualEnvDataMode) {
      return "手动输入模式";
    } else if (isBluetoothConnected) {
      return qiongshuConnected ? "已连接青书AI设备" : "已连接普通设备";
    } else if (bluetoothState === 'disabled') {
      return "蓝牙功能已关闭";
    } else if (bluetoothState === 'unavailable') {
      return "不支持蓝牙功能";
    } else {
      return "未连接设备";
    }
  };
  
  const getDetailText = () => {
    if (manualEnvDataMode) {
      return "使用手动输入的环境数据进行分析";
    } else if (isBluetoothConnected) {
      return qiongshuConnected ? 
        "青书AI专用设备已连接，环境数据已准备就绪" : 
        "设备已连接，但推荐使用青书AI专用设备获取更精准的数据";
    } else if (bluetoothState === 'disabled') {
      return "请在设备设置中开启蓝牙功能，或使用手动输入模式";
    } else if (bluetoothState === 'unavailable') {
      return "您的设备不支持蓝牙功能，请使用手动输入模式";
    } else {
      return "请连接蓝牙设备以采集环境数据，推荐使用青书AI专用设备";
    }
  };
  
  const getNoticeContent = () => {
    if (bluetoothState === 'disabled') {
      return "蓝牙功能未开启，请在设备设置中开启蓝牙功能，或者启用手动输入模式。";
    } else if (bluetoothState === 'unavailable') {
      return "您的设备不支持蓝牙功能，请启用手动输入模式以继续分析。";
    } else {
      return "未检测到蓝牙设备连接，请在设备页启用蓝牙并连接青书AI设备，或者启用手动输入模式。";
    }
  };
  
  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-3">
        <Badge 
          variant="outline" 
          className={
            manualEnvDataMode ? "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300" :
            isBluetoothConnected ? 
              qiongshuConnected ? "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300" 
                                : "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300"
            : bluetoothState === 'disabled' ? "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300"
            : "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300"
          }
        >
          {getStatusIcon()}
          {getStatusText()}
        </Badge>
        <span className="text-sm text-muted-foreground">
          {getDetailText()}
        </span>
      </div>
      
      {!isBluetoothConnected && !manualEnvDataMode && (
        <div className="text-sm bg-amber-50 border border-amber-200 rounded p-3 text-amber-800 dark:bg-amber-900/20 dark:border-amber-800 dark:text-amber-300">
          <p className="flex items-center">
            <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" />
            {getNoticeContent()}
          </p>
        </div>
      )}
    </div>
  );
};

export default ConnectionStatus;
