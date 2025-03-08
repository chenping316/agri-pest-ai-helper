
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { DiagnosisResult as DiagnosisResultType } from "@/types";
import { AlertTriangle, CheckCircle2, DollarSign, ZapIcon, ListChecks } from "lucide-react";
import { cn } from "@/lib/utils";

interface DiagnosisResultComponentProps {
  result: DiagnosisResultType;
  className?: string;
}

const DiagnosisResult: React.FC<DiagnosisResultComponentProps> = ({ 
  result,
  className 
}) => {
  const confidenceColor = () => {
    if (result.confidence >= 0.9) return "text-green-600";
    if (result.confidence >= 0.7) return "text-amber-600";
    return "text-red-600";
  };

  const costBadge = (cost: 'low' | 'medium' | 'high') => {
    switch (cost) {
      case 'low':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">低成本</Badge>;
      case 'medium':
        return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">中等成本</Badge>;
      case 'high':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">高成本</Badge>;
    }
  };

  const effectivenessBadge = (effectiveness: 'low' | 'medium' | 'high') => {
    switch (effectiveness) {
      case 'low':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">效果一般</Badge>;
      case 'medium':
        return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">效果中等</Badge>;
      case 'high':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">效果显著</Badge>;
    }
  };

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl">{result.name}</CardTitle>
            <CardDescription>诊断结果</CardDescription>
          </div>
          <div className="flex items-center">
            <span className={cn("font-semibold text-sm", confidenceColor())}>
              置信度: {(result.confidence * 100).toFixed(1)}%
            </span>
            {result.confidence >= 0.8 ? (
              <CheckCircle2 className="w-5 h-5 ml-1 text-green-600" />
            ) : (
              <AlertTriangle className="w-5 h-5 ml-1 text-amber-600" />
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h4 className="font-medium mb-1">症状与描述</h4>
          <p className="text-sm text-muted-foreground">{result.description}</p>
        </div>
        
        <div>
          <h4 className="font-medium mb-2 flex items-center">
            <ListChecks className="h-4 w-4 mr-1 text-primary" />
            推荐处理方法 ({result.treatments.length}种)
          </h4>
          <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
            {result.treatments.map((treatment, index) => (
              <div key={index} className="p-3 bg-muted/40 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <div className="font-medium">{treatment.method}</div>
                  <div className="flex gap-1">
                    {costBadge(treatment.cost)}
                    {effectivenessBadge(treatment.effectiveness)}
                  </div>
                </div>
                <div className="text-sm text-muted-foreground mb-2">
                  {treatment.description}
                </div>
                <div className="flex items-center text-sm">
                  <DollarSign className="h-4 w-4 mr-1 text-muted-foreground" />
                  <span>预估费用: {treatment.estimatedPrice}</span>
                </div>
                
                {index === 0 && (
                  <div className="mt-2 flex items-center text-xs text-primary">
                    <ZapIcon className="h-3 w-3 mr-1" />
                    <span>推荐方案: 性价比最高</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </CardContent>
      <CardFooter className="text-xs text-muted-foreground justify-center">
        诊断结果仅供参考，建议结合实际情况采取相应措施
      </CardFooter>
    </Card>
  );
};

export default DiagnosisResult;
