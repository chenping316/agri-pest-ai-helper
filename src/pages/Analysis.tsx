
import React, { useState } from "react";
import { Navigate } from "react-router-dom";
import { useAppContext } from "@/context/AppContext";
import { Image, Smartphone, Wifi, WifiOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { analyzePlantDisease, analyzeWithMultipleModels } from "@/utils/aiAnalysis";
import Navigation from "@/components/Navigation";
import SearchResults from "@/components/SearchResults";
import AnalysisHeader from "@/components/analysis/AnalysisHeader";
import ConnectionStatus from "@/components/analysis/ConnectionStatus";
import AnalysisInput from "@/components/analysis/AnalysisInput";
import AnalysisOutput from "@/components/analysis/AnalysisOutput";
import InfoMessages from "@/components/analysis/InfoMessages";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

const Analysis: React.FC = () => {
  const { 
    isLoggedIn, 
    analysisMode, 
    setAnalysisMode,
    isBluetoothConnected,
    envData,
    capturedImage,
    setCapturedImage,
    diagnosisResult,
    setDiagnosisResult,
    isAnalyzing,
    setIsAnalyzing,
    addToHistory,
    selectedPlantType
  } = useAppContext();
  
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchDialogOpen, setSearchDialogOpen] = useState(false);
  const [useMultiModel, setUseMultiModel] = useState(true); // 默认启用多模型分析
  const { toast } = useToast();

  const handleImageCapture = (imageUrl: string) => {
    setCapturedImage(imageUrl);
    setDiagnosisResult(null);
  };

  const performAnalysis = async () => {
    if (!capturedImage) {
      toast({
        title: "缺少图片",
        description: "请先拍摄或上传植物的照片",
        variant: "destructive"
      });
      return;
    }
    
    if (analysisMode === "image-and-env" && !isBluetoothConnected) {
      toast({
        title: "未连接设备",
        description: "您选择了环境数据分析模式，请先连接蓝牙设备",
        variant: "destructive"
      });
      return;
    }
    
    setIsAnalyzing(true);
    setAnalysisProgress(0);
    
    // Simulate progress updates
    const interval = setInterval(() => {
      setAnalysisProgress(prev => {
        const next = prev + Math.random() * 15;
        return next >= 100 ? 99 : next;
      });
    }, 500);
    
    try {
      // 根据用户选择的分析模式调用不同的分析函数
      const result = useMultiModel 
        ? await analyzeWithMultipleModels(
            capturedImage,
            analysisMode,
            selectedPlantType || undefined,
            envData || undefined
          )
        : await analyzePlantDisease(
            capturedImage,
            analysisMode,
            selectedPlantType || undefined,
            envData || undefined
          );
      
      setDiagnosisResult(result);
      
      // Add to history
      addToHistory({
        imageUrl: capturedImage,
        plantType: selectedPlantType || undefined,
        envData: analysisMode === "image-and-env" ? envData || undefined : undefined,
        diagnosis: result
      });
      
      toast({
        title: "分析完成",
        description: `检测到: ${result.name}，置信度: ${(result.confidence * 100).toFixed(1)}%`
      });
    } catch (error) {
      console.error("Analysis error:", error);
      toast({
        title: "分析失败",
        description: "无法完成分析，请重试",
        variant: "destructive"
      });
    } finally {
      clearInterval(interval);
      setAnalysisProgress(100);
      setTimeout(() => setIsAnalyzing(false), 500);
    }
  };

  const resetAnalysis = () => {
    setCapturedImage(null);
    setDiagnosisResult(null);
  };

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navigation />
      
      <main className="flex-1">
        <div className="container px-4 py-6">
          <AnalysisHeader 
            analysisMode={analysisMode} 
            setAnalysisMode={setAnalysisMode} 
          />
          
          {analysisMode === "image-and-env" && (
            <ConnectionStatus isBluetoothConnected={isBluetoothConnected} />
          )}
          
          <div className="mb-4 flex items-center justify-end space-x-2">
            <Switch 
              id="multi-model" 
              checked={useMultiModel} 
              onCheckedChange={setUseMultiModel} 
            />
            <Label htmlFor="multi-model" className="cursor-pointer">
              {useMultiModel ? "多模型分析（更准确）" : "单模型分析（更快）"}
            </Label>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            <AnalysisInput 
              onCapture={handleImageCapture} 
              analysisMode={analysisMode}
            />
            
            <AnalysisOutput 
              isAnalyzing={isAnalyzing}
              analysisProgress={analysisProgress}
              diagnosisResult={diagnosisResult}
              capturedImage={capturedImage}
              resetAnalysis={resetAnalysis}
              performAnalysis={performAnalysis}
            />
          </div>
          
          <InfoMessages 
            analysisMode={analysisMode}
            isBluetoothConnected={isBluetoothConnected}
          />
        </div>
      </main>
      
      <SearchResults 
        query={searchQuery}
        open={searchDialogOpen}
        onOpenChange={setSearchDialogOpen}
      />
    </div>
  );
};

export default Analysis;
