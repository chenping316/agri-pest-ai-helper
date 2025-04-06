
import React, { useState } from "react";
import { Navigate } from "react-router-dom";
import { useAppContext } from "@/context/AppContext";
import { Image } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { 
  analyzePlantDisease, 
  analyzeWithMultipleModels,
  analyzeWithSuperMultipleModels,
  AnalysisModelType 
} from "@/utils/aiAnalysis";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const Analysis: React.FC = () => {
  const { 
    isLoggedIn, 
    analysisMode, 
    setAnalysisMode,
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
  const [useSuperMultiModel, setUseSuperMultiModel] = useState(false); // 默认不启用四模型分析
  const [selectedModel, setSelectedModel] = useState<AnalysisModelType>('taichu'); // 默认使用Taichu-VL模型
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
      let result;
      
      if (useSuperMultiModel) {
        // 使用多模型分析
        result = await analyzeWithSuperMultipleModels(
          capturedImage,
          analysisMode,
          selectedPlantType || undefined,
          envData || undefined
        );
      } else if (useMultiModel) {
        // 使用多模型分析
        result = await analyzeWithMultipleModels(
          capturedImage,
          analysisMode,
          selectedPlantType || undefined,
          envData || undefined
        );
      } else {
        // 使用单模型分析
        result = await analyzePlantDisease(
          capturedImage,
          analysisMode,
          selectedPlantType || undefined,
          envData || undefined,
          selectedModel
        );
      }
      
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
            <ConnectionStatus />
          )}
          
          <div className="mb-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-2">
            <div className="flex flex-col space-y-2 w-full">
              <div className="flex items-center space-x-2">
                <Switch 
                  id="multi-model" 
                  checked={useMultiModel || useSuperMultiModel} 
                  onCheckedChange={(checked) => {
                    setUseMultiModel(checked);
                    if (!checked) setUseSuperMultiModel(false);
                  }} 
                />
                <Label htmlFor="multi-model" className="cursor-pointer">
                  {useMultiModel || useSuperMultiModel ? "多模型分析（更准确）" : "单模型分析（更快）"}
                </Label>
              </div>
              
              {useMultiModel && (
                <div className="flex items-center space-x-2 ml-6">
                  <Switch 
                    id="super-multi-model" 
                    checked={useSuperMultiModel} 
                    onCheckedChange={setUseSuperMultiModel} 
                  />
                  <Label htmlFor="super-multi-model" className="cursor-pointer">
                    {useSuperMultiModel ? "三模型超级分析（最准确）" : "双模型标准分析"}
                  </Label>
                </div>
              )}
            </div>
            
            {!useMultiModel && !useSuperMultiModel && (
              <div className="flex items-center space-x-2 w-full md:w-auto">
                <Label htmlFor="model-select">选择模型:</Label>
                <Select 
                  value={selectedModel} 
                  onValueChange={(value) => setSelectedModel(value as AnalysisModelType)}
                >
                  <SelectTrigger id="model-select" className="w-[180px]">
                    <SelectValue placeholder="选择AI模型" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="taichu">Taichu-VL (快速)</SelectItem>
                    <SelectItem value="zhipu">智谱清言 (精准)</SelectItem>
                    <SelectItem value="qwen">通义千问 (稳定)</SelectItem>
                    <SelectItem value="spark">讯飞星火 (综合)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
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
