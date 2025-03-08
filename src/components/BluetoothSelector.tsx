
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Bluetooth, RefreshCw, Check, X } from "lucide-react";
import { useAppContext } from "@/context/AppContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const BluetoothSelector: React.FC = () => {
  const { 
    isBluetoothConnected, 
    bluetoothDevices, 
    scanForDevices, 
    connectToDevice,
    disconnectDevice,
    envData
  } = useAppContext();
  const [isScanning, setIsScanning] = useState(false);
  const { toast } = useToast();

  const handleScan = async () => {
    setIsScanning(true);
    try {
      await scanForDevices();
      toast({
        title: "扫描完成",
        description: `发现 ${bluetoothDevices.length} 个设备`,
      });
    } catch (error) {
      console.error("Error scanning for devices:", error);
      toast({
        title: "扫描失败",
        description: "无法扫描蓝牙设备，请检查蓝牙是否已启用。",
        variant: "destructive"
      });
    } finally {
      setIsScanning(false);
    }
  };

  const handleConnect = async (deviceId: string) => {
    try {
      await connectToDevice(deviceId);
      toast({
        title: "连接成功",
        description: "已成功连接到设备",
      });
    } catch (error) {
      console.error("Error connecting to device:", error);
      toast({
        title: "连接失败",
        description: "无法连接到设备，请重试。",
        variant: "destructive"
      });
    }
  };

  const handleDisconnect = () => {
    disconnectDevice();
    toast({
      title: "已断开连接",
      description: "已成功断开与设备的连接",
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">蓝牙设备</h3>
        <Button 
          onClick={handleScan} 
          variant="outline" 
          size="sm"
          disabled={isScanning}
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${isScanning ? 'animate-spin' : ''}`} />
          {isScanning ? "扫描中..." : "扫描设备"}
        </Button>
      </div>
      
      <Separator />
      
      {bluetoothDevices.length > 0 ? (
        <div className="space-y-3">
          {bluetoothDevices.map((device) => (
            <div 
              key={device.id}
              className="flex items-center justify-between p-3 bg-muted/50 rounded-md"
            >
              <div className="flex items-center">
                <Bluetooth className="h-4 w-4 mr-2 text-primary" />
                <span>{device.name}</span>
                {device.connected && (
                  <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full dark:bg-green-800 dark:text-green-100">
                    已连接
                  </span>
                )}
              </div>
              
              <Button
                size="sm"
                variant={device.connected ? "destructive" : "default"}
                onClick={() => device.connected ? handleDisconnect() : handleConnect(device.id)}
              >
                {device.connected ? (
                  <>
                    <X className="mr-1 h-4 w-4" />
                    断开
                  </>
                ) : (
                  <>
                    <Check className="mr-1 h-4 w-4" />
                    连接
                  </>
                )}
              </Button>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-6 text-muted-foreground">
          {isScanning ? "正在搜索设备..." : "未发现设备，请点击扫描按钮"}
        </div>
      )}
      
      {envData && (
        <Card className="mt-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">环境数据</CardTitle>
            <CardDescription>从设备获取的最新数据</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex justify-between">
                <span className="font-medium">土壤湿度:</span>
                <span>{envData.soilMoisture.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">土壤温度:</span>
                <span>{envData.soilTemperature.toFixed(1)}°C</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">土壤pH值:</span>
                <span>{envData.soilPh.toFixed(1)}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">空气温度:</span>
                <span>{envData.airTemperature.toFixed(1)}°C</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">空气湿度:</span>
                <span>{envData.airHumidity.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">数据时间:</span>
                <span>{envData.timestamp.toLocaleTimeString()}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default BluetoothSelector;
