
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAppContext } from "@/context/AppContext";
import { Camera, Calendar, Bluetooth, LineChart } from "lucide-react";
import { Link } from "react-router-dom";
import { Navigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import HistoryItem from "@/components/HistoryItem";

const Index: React.FC = () => {
  const { isLoggedIn, history, setAnalysisMode } = useAppContext();

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navigation />
      
      <main className="flex-1">
        <div className="container px-4 py-6 md:py-10">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-primary">农业病虫害AI检测系统</h1>
            <p className="text-muted-foreground mt-2">
              智能分析，精准诊断，为农作物健康保驾护航
            </p>
          </div>
          
          <div className="grid gap-4 md:grid-cols-2 mb-8">
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>开始检测</CardTitle>
                <CardDescription>
                  选择检测模式，拍摄或上传植物照片进行分析
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2">
                <Link to="/analysis" onClick={() => setAnalysisMode("image-only")}>
                  <Button variant="outline" className="w-full h-20 flex flex-col gap-2 bg-secondary/20">
                    <Camera className="h-6 w-6" />
                    <span>仅图片分析</span>
                  </Button>
                </Link>
                <Link to="/analysis" onClick={() => setAnalysisMode("image-and-env")}>
                  <Button variant="outline" className="w-full h-20 flex flex-col gap-2 bg-primary/10">
                    <LineChart className="h-6 w-6" />
                    <span>图片 + 环境数据分析</span>
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
          
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">最近分析记录</h2>
              <Link to="/history">
                <Button variant="ghost" size="sm" className="gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>查看全部</span>
                </Button>
              </Link>
            </div>
            
            {history.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {history.slice(0, 3).map((record) => (
                  <HistoryItem key={record.id} record={record} />
                ))}
              </div>
            ) : (
              <Card className="bg-muted/50">
                <CardContent className="flex flex-col items-center justify-center py-8">
                  <p className="text-muted-foreground mb-4">暂无分析记录</p>
                  <Link to="/analysis">
                    <Button>开始首次分析</Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </div>
          
          <div>
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Bluetooth className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">环境数据采集</CardTitle>
                </div>
                <CardDescription>
                  连接蓝牙设备，采集农田环境数据以提高分析准确度
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center sm:flex-row sm:justify-between gap-4">
                <div className="text-sm text-muted-foreground">
                  通过连接土壤空气综合检测仪，获取土壤湿度、温度、pH值及空气温湿度等数据
                </div>
                <Link to="/analysis" onClick={() => setAnalysisMode("image-and-env")}>
                  <Button>连接设备</Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      
      <footer className="py-6 border-t bg-muted/30">
        <div className="container px-4 text-center text-sm text-muted-foreground">
          <p>农业病虫害AI检测系统 &copy; {new Date().getFullYear()}</p>
          <p className="mt-1">本地化AI分析，无需网络连接，保护您的数据安全</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
