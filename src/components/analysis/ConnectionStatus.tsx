
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Wifi, WifiOff } from "lucide-react";

interface ConnectionStatusProps {
  isBluetoothConnected: boolean;
}

const ConnectionStatus: React.FC<ConnectionStatusProps> = ({
  isBluetoothConnected,
}) => {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-3">
        <Badge 
          variant="outline" 
          className={isBluetoothConnected ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}
        >
          {isBluetoothConnected ? (
            <>
              <Wifi className="h-3 w-3 mr-1 animate-pulse-green" />
              已连接设备
            </>
          ) : (
            <>
              <WifiOff className="h-3 w-3 mr-1" />
              未连接设备
            </>
          )}
        </Badge>
        <span className="text-sm text-muted-foreground">
          {isBluetoothConnected 
            ? "环境数据已准备就绪，可以开始分析" 
            : "请连接蓝牙设备以采集环境数据"}
        </span>
      </div>
    </div>
  );
};

export default ConnectionStatus;
