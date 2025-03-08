
import React from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { HistoryRecord } from "@/types";
import { CalendarIcon, Thermometer, Droplets } from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";

interface HistoryItemProps {
  record: HistoryRecord;
  className?: string;
}

const HistoryItem: React.FC<HistoryItemProps> = ({ 
  record,
  className 
}) => {
  const formattedDate = new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(record.timestamp);

  return (
    <Link to={`/history/${record.id}`}>
      <Card className={cn("w-full hover:shadow-md transition-shadow cursor-pointer", className)}>
        <CardContent className="p-0">
          <div className="aspect-video w-full overflow-hidden rounded-t-lg">
            <img 
              src={record.imageUrl} 
              alt={record.diagnosis.name} 
              className="w-full h-full object-cover"
            />
          </div>
          <div className="p-4">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-medium text-base">{record.diagnosis.name}</h3>
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                {(record.diagnosis.confidence * 100).toFixed(0)}%
              </Badge>
            </div>
            
            {record.envData && (
              <div className="flex flex-wrap gap-2 mb-2">
                <div className="text-xs flex items-center text-muted-foreground">
                  <Thermometer className="h-3 w-3 mr-1" />
                  <span>土壤: {record.envData.soilTemperature.toFixed(1)}°C</span>
                </div>
                <div className="text-xs flex items-center text-muted-foreground">
                  <Droplets className="h-3 w-3 mr-1" />
                  <span>湿度: {record.envData.soilMoisture.toFixed(1)}%</span>
                </div>
              </div>
            )}
            
            <div className="truncate text-sm text-muted-foreground">
              {record.diagnosis.treatments[0].method}
            </div>
          </div>
        </CardContent>
        <CardFooter className="border-t px-4 py-2">
          <div className="text-xs text-muted-foreground flex items-center">
            <CalendarIcon className="h-3 w-3 mr-1" />
            <span>{formattedDate}</span>
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
};

export default HistoryItem;
