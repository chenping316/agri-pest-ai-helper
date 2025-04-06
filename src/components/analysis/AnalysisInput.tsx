
import React from "react";
import { AnalysisMode } from "@/types";
import CameraComponent from "@/components/CameraComponent";
import PlantTypeSelector from "@/components/PlantTypeSelector";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useAppContext } from "@/context/AppContext";

interface AnalysisInputProps {
  onCapture: (imageUrl: string) => void;
  analysisMode: AnalysisMode;
}

const AnalysisInput: React.FC<AnalysisInputProps> = ({
  onCapture,
  analysisMode,
}) => {
  const { manualEnvData, updateManualEnvData } = useAppContext();

  const handleManualInputChange = (field: keyof typeof manualEnvData, value: string) => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue)) {
      updateManualEnvData(field, numValue);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border p-4">
        <h2 className="text-lg font-medium mb-4">图像采集</h2>
        <CameraComponent onCapture={onCapture} />
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border p-4 space-y-4">
        <PlantTypeSelector />
        
        {analysisMode === "image-and-env" && (
          <Card className="mt-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">环境数据输入</CardTitle>
              <CardDescription>请输入环境数据以提高分析精度</CardDescription>
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
      </div>
    </div>
  );
};

export default AnalysisInput;
