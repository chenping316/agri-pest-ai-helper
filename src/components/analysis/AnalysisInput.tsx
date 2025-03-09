
import React from "react";
import { AnalysisMode } from "@/types";
import CameraComponent from "@/components/CameraComponent";
import PlantTypeSelector from "@/components/PlantTypeSelector";
import BluetoothSelector from "@/components/BluetoothSelector";

interface AnalysisInputProps {
  onCapture: (imageUrl: string) => void;
  analysisMode: AnalysisMode;
}

const AnalysisInput: React.FC<AnalysisInputProps> = ({
  onCapture,
  analysisMode,
}) => {
  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border p-4">
        <h2 className="text-lg font-medium mb-4">图像采集</h2>
        <CameraComponent onCapture={onCapture} />
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border p-4 space-y-4">
        <PlantTypeSelector />
        
        {analysisMode === "image-and-env" && (
          <BluetoothSelector />
        )}
      </div>
    </div>
  );
};

export default AnalysisInput;
