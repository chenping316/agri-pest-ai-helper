
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Bluetooth, RefreshCw, Check, X, AlertCircle } from "lucide-react";
import { useAppContext } from "@/context/AppContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const BluetoothSelector: React.FC = () => {
  const { 
    isBluetoothConnected, 
    bluetoothDevices, 
    scanForDevices, 
    connectToDevice,
    disconnectDevice,
    envData,
    manualEnvDataMode,
    setManualEnvDataMode,
    updateManualEnvData,
    manualEnvData,
    bluetoothState
  } = useAppContext();
  
  const [isScanning, setIsScanning] = useState(false);
  const [hasQiongshuDevice, setHasQiongshuDevice] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // 检查是否有名为 qiongshuAI 的设备
    const qiongshuDevice = bluetoothDevices.find(device => device.name.includes("qiongshuAI"));
    setHasQiongshuDevice(!!qiongshuDevice);
  }, [bluetoothDevices]);

  const handleScan = async () => {
    setIsScanning(true);
    try {
      await scanForDevices();
      
      // 如果扫描后未找到设备，自动启用手动输入模式
      if (bluetoothDevices.length === 0) {
        setManualEnvDataMode(true);
        toast({
          title: "未检测到蓝牙设备",
          description: "已自动切换到手动输入模式",
        });
      } else {
        toast({
          title: "扫描完成",
          description: `发现 ${bluetoothDevices.length} 个设备`,
        });
      }
    } catch (error) {
      console.error("Error scanning for devices:", error);
      
      // 如果发生错误，自动启用手动输入模式
      setManualEnvDataMode(true);
      
      toast({
        title: "扫描失败",
        description: "无法扫描蓝牙设备，已切换到手动输入模式。",
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

  const handleManualInputChange = (field: keyof typeof manualEnvData, value: string) => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue)) {
      updateManualEnvData(field, numValue);
    }
  };
  
  const getBluetoothStateMessage = () => {
    switch(bluetoothState) {
      case 'unavailable':
        return "您的设备不支持蓝牙功能";
      case 'disabled':
        return "请打开蓝牙功能后再尝试扫描";
      case 'noDevices':
        return "未检测到任何蓝牙设备，请确保设备已开启并在有效范围内";
      default:
        return "未检测到任何蓝牙设备，请确保蓝牙已开启并在有效范围内，然后点击\"扫描设备\"重试。";
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">蓝牙设备</h3>
        <Button 
          onClick={handleScan} 
          variant="outline" 
          size="sm"
          disabled={isScanning || bluetoothState === 'unavailable'}
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${isScanning ? 'animate-spin' : ''}`} />
          {isScanning ? "扫描中..." : "扫描设备"}
        </Button>
      </div>
      
      <Separator />
      
      {bluetoothDevices.length === 0 && !manualEnvDataMode && (
        <div className="p-4 border border-amber-200 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-800 rounded-md flex items-center">
          <AlertCircle className="text-amber-600 dark:text-amber-400 h-5 w-5 mr-2 flex-shrink-0" />
          <div className="text-amber-800 dark:text-amber-300 text-sm">
            {getBluetoothStateMessage()}
          </div>
        </div>
      )}
      
      {bluetoothDevices.length > 0 && !hasQiongshuDevice && !manualEnvDataMode && (
        <div className="p-4 border border-amber-200 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-800 rounded-md flex items-center">
          <AlertCircle className="text-amber-600 dark:text-amber-400 h-5 w-5 mr-2 flex-shrink-0" />
          <div className="text-amber-800 dark:text-amber-300 text-sm">
            无法检测到 qiongshuAI 设备，请确保蓝牙已开启并在有效范围内，然后点击\"扫描设备\"重试。
          </div>
        </div>
      )}
      
      <div className="flex items-center space-x-2">
        <Label htmlFor="manual-mode" className="cursor-pointer">手动输入模式</Label>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => setManualEnvDataMode(!manualEnvDataMode)}
          className={manualEnvDataMode ? "bg-primary text-primary-foreground hover:bg-primary/90" : ""}
        >
          {manualEnvDataMode ? "已启用" : "未启用"}
        </Button>
      </div>
      
      {manualEnvDataMode && (
        <Card className="mt-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">手动输入环境数据</CardTitle>
            <CardDescription>在无法连接到设备时使用此模式</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="soilMoisture">土壤湿度 (%)</Label>
                <Input 
                  id="soilMoisture" 
                  type="number" 
                  placeholder="0-100" 
                  value={manualEnvData.soilMoisture.toString()} 
                  onChange={(e) => handleManualInputChange('soilMoisture', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="soilTemperature">土壤温度 (°C)</Label>
                <Input 
                  id="soilTemperature" 
                  type="number" 
                  placeholder="0-50" 
                  value={manualEnvData.soilTemperature.toString()} 
                  onChange={(e) => handleManualInputChange('soilTemperature', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="soilPh">土壤pH值</Label>
                <Input 
                  id="soilPh" 
                  type="number" 
                  placeholder="0-14" 
                  value={manualEnvData.soilPh.toString()} 
                  onChange={(e) => handleManualInputChange('soilPh', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="airTemperature">空气温度 (°C)</Label>
                <Input 
                  id="airTemperature" 
                  type="number" 
                  placeholder="0-50" 
                  value={manualEnvData.airTemperature.toString()} 
                  onChange={(e) => handleManualInputChange('airTemperature', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="airHumidity">空气湿度 (%)</Label>
                <Input 
                  id="airHumidity" 
                  type="number" 
                  placeholder="0-100" 
                  value={manualEnvData.airHumidity.toString()} 
                  onChange={(e) => handleManualInputChange('airHumidity', e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      {!manualEnvDataMode && (
        <>
          {bluetoothDevices.length > 0 ? (
            <div className="space-y-3">
              {bluetoothDevices.map((device) => (
                <div 
                  key={device.id}
                  className={`flex items-center justify-between p-3 rounded-md ${
                    device.name.includes("qiongshuAI") 
                      ? "bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800" 
                      : "bg-muted/50"
                  }`}
                >
                  <div className="flex items-center">
                    <Bluetooth className={`h-4 w-4 mr-2 ${
                      device.name.includes("qiongshuAI") ? "text-green-600" : "text-primary"
                    }`} />
                    <span>{device.name}</span>
                    {device.connected && (
                      <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full dark:bg-green-800 dark:text-green-100">
                        已连接
                      </span>
                    )}
                    {device.name.includes("qiongshuAI") && !device.connected && (
                      <span className="ml-2 text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full dark:bg-amber-800 dark:text-amber-100">
                        推荐连接
                      </span>
                    )}
                  </div>
                  
                  <Button
                    size="sm"
                    variant={device.connected ? "destructive" : device.name.includes("qiongshuAI") ? "default" : "outline"}
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
        </>
      )}
      
      {envData && !manualEnvDataMode && (
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
