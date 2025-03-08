
import React from "react";
import { useParams, Navigate, useNavigate } from "react-router-dom";
import { useAppContext } from "@/context/AppContext";
import Navigation from "@/components/Navigation";
import DiagnosisResult from "@/components/DiagnosisResult";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, Thermometer, Droplets } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const HistoryDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { isLoggedIn, history } = useAppContext();
  const navigate = useNavigate();

  const record = history.find(item => item.id === id);

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  if (!record) {
    return <Navigate to="/history" replace />;
  }

  const formattedDate = new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  }).format(record.timestamp);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navigation />
      
      <main className="flex-1">
        <div className="container px-4 py-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate(-1)}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            返回历史记录
          </Button>
          
          <div className="flex flex-col md:flex-row gap-6">
            <div className="md:w-1/2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">分析图片</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="aspect-video w-full overflow-hidden rounded-md">
                    <img 
                      src={record.imageUrl} 
                      alt={record.diagnosis.name} 
                      className="w-full h-full object-contain bg-muted"
                    />
                  </div>
                  
                  <div className="mt-4 text-sm text-muted-foreground flex items-center">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span>分析时间: {formattedDate}</span>
                  </div>
                </CardContent>
              </Card>
              
              {record.envData && (
                <Card className="mt-4">
                  <CardHeader>
                    <CardTitle className="text-lg">环境数据</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-muted/50 p-3 rounded-md">
                        <div className="text-sm text-muted-foreground mb-1">土壤湿度</div>
                        <div className="text-xl font-medium flex items-center">
                          <Droplets className="h-5 w-5 mr-2 text-blue-500" />
                          {record.envData.soilMoisture.toFixed(1)}%
                        </div>
                      </div>
                      
                      <div className="bg-muted/50 p-3 rounded-md">
                        <div className="text-sm text-muted-foreground mb-1">土壤温度</div>
                        <div className="text-xl font-medium flex items-center">
                          <Thermometer className="h-5 w-5 mr-2 text-red-500" />
                          {record.envData.soilTemperature.toFixed(1)}°C
                        </div>
                      </div>
                      
                      <div className="bg-muted/50 p-3 rounded-md">
                        <div className="text-sm text-muted-foreground mb-1">土壤pH值</div>
                        <div className="text-xl font-medium">
                          {record.envData.soilPh.toFixed(1)}
                        </div>
                      </div>
                      
                      <div className="bg-muted/50 p-3 rounded-md">
                        <div className="text-sm text-muted-foreground mb-1">空气温度</div>
                        <div className="text-xl font-medium flex items-center">
                          <Thermometer className="h-5 w-5 mr-2 text-orange-500" />
                          {record.envData.airTemperature.toFixed(1)}°C
                        </div>
                      </div>
                      
                      <div className="bg-muted/50 p-3 rounded-md">
                        <div className="text-sm text-muted-foreground mb-1">空气湿度</div>
                        <div className="text-xl font-medium flex items-center">
                          <Droplets className="h-5 w-5 mr-2 text-blue-500" />
                          {record.envData.airHumidity.toFixed(1)}%
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
            
            <div className="md:w-1/2">
              <DiagnosisResult result={record.diagnosis} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default HistoryDetail;
