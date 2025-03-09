
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAppContext } from "@/context/AppContext";
import { Bug, Image, Loader2, Smartphone, Wifi, WifiOff, ExternalLink, Search } from "lucide-react";
import { Navigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import CameraComponent from "@/components/CameraComponent";
import BluetoothSelector from "@/components/BluetoothSelector";
import PlantTypeSelector from "@/components/PlantTypeSelector";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { analyzePlantDisease, searchAdditionalTreatments } from "@/utils/aiAnalysis";
import DiagnosisResult from "@/components/DiagnosisResult";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";

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
      const result = await analyzePlantDisease(
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

  const handleSearchAdditionalInfo = () => {
    if (diagnosisResult) {
      searchAdditionalTreatments(diagnosisResult.name, selectedPlantType || undefined);
    }
  };

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navigation />
      
      <main className="flex-1">
        <div className="container px-4 py-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Bug className="h-6 w-6 text-primary" />
                病虫害分析
              </h1>
              <p className="text-muted-foreground">拍摄或上传植物照片进行分析</p>
            </div>
            
            <div className="flex gap-2">
              <Button
                variant={analysisMode === "image-only" ? "default" : "outline"}
                size="sm"
                onClick={() => setAnalysisMode("image-only")}
                className={analysisMode === "image-only" ? "" : "text-muted-foreground"}
              >
                <Image className="h-4 w-4 mr-2" />
                仅图片分析
              </Button>
              <Button
                variant={analysisMode === "image-and-env" ? "default" : "outline"}
                size="sm"
                onClick={() => setAnalysisMode("image-and-env")}
                className={analysisMode === "image-and-env" ? "" : "text-muted-foreground"}
              >
                <Smartphone className="h-4 w-4 mr-2" />
                图片 + 环境数据
              </Button>
            </div>
          </div>
          
          {analysisMode === "image-and-env" && (
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <Badge variant="outline" className={isBluetoothConnected ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
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
          )}
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-6">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border p-4">
                <h2 className="text-lg font-medium mb-4">图像采集</h2>
                <CameraComponent onCapture={handleImageCapture} />
              </div>
              
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border p-4 space-y-4">
                <PlantTypeSelector />
                
                {analysisMode === "image-and-env" && (
                  <BluetoothSelector />
                )}
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border p-4">
              <h2 className="text-lg font-medium mb-4">分析结果</h2>
              
              {isAnalyzing ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 text-primary animate-spin mb-4" />
                  <p className="text-muted-foreground mb-4">正在分析中，请稍候...</p>
                  <div className="w-full max-w-xs">
                    <Progress value={analysisProgress} className="h-2" />
                  </div>
                </div>
              ) : diagnosisResult ? (
                <div className="space-y-4">
                  <DiagnosisResult result={diagnosisResult} />
                  
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button onClick={resetAnalysis} variant="outline" className="flex-1">
                      重新分析
                    </Button>
                    <Button 
                      onClick={handleSearchAdditionalInfo}
                      variant="secondary"
                      className="flex-1"
                    >
                      <Search className="h-4 w-4 mr-2" />
                      百度搜索更多防治方法
                    </Button>
                  </div>
                </div>
              ) : capturedImage ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <img 
                    src={capturedImage} 
                    alt="Captured" 
                    className="w-full max-w-xs h-auto object-contain rounded-md mb-4"
                  />
                  <div className="flex gap-2">
                    <Button onClick={resetAnalysis} variant="outline">
                      重新拍摄
                    </Button>
                    <Button onClick={performAnalysis}>
                      开始分析
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Image className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground mb-2">未检测到图片</p>
                  <p className="text-sm text-muted-foreground">
                    请先拍摄或上传植物照片
                  </p>
                </div>
              )}
            </div>
          </div>
          
          {analysisMode === "image-and-env" && !isBluetoothConnected && (
            <div className="mt-6 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
              <h3 className="text-amber-800 dark:text-amber-200 font-medium mb-1">提示</h3>
              <p className="text-sm text-amber-700 dark:text-amber-300">
                您选择了图片 + 环境数据分析模式，但未连接蓝牙设备。环境数据能够提高分析准确性，建议连接设备后再进行分析。
              </p>
            </div>
          )}
          
          <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <h3 className="text-blue-800 dark:text-blue-200 font-medium flex items-center gap-1 mb-1">
              <ExternalLink className="h-4 w-4" />
              网络搜索功能
            </h3>
            <p className="text-sm text-blue-700 dark:text-blue-300">
              分析完成后，系统会自动通过百度搜索相关的防治方法。您也可以点击"百度搜索更多防治方法"获取更多详细信息。
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Analysis;
