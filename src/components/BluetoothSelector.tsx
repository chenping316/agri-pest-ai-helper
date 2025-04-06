
import React from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAppContext } from "@/context/AppContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const BluetoothSelector: React.FC = () => {
  const { 
    envData,
    manualEnvData,
    updateManualEnvData,
  } = useAppContext();
  
  const { toast } = useToast();

  const handleManualInputChange = (field: keyof typeof manualEnvData, value: string) => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue)) {
      updateManualEnvData(field, numValue);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">环境数据输入</h3>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">手动输入环境数据</CardTitle>
          <CardDescription>请输入环境参数数据</CardDescription>
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
      
      {envData && (
        <Card className="mt-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">环境数据</CardTitle>
            <CardDescription>当前环境数据</CardDescription>
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
