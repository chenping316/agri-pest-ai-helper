
import React from "react";
import { Button } from "@/components/ui/button";

interface ResultActionsProps {
  resetAnalysis: () => void;
}

const ResultActions: React.FC<ResultActionsProps> = ({
  resetAnalysis,
}) => {
  return (
    <div className="flex flex-col sm:flex-row gap-2">
      <Button onClick={resetAnalysis} variant="outline" className="flex-1">
        重新分析
      </Button>
    </div>
  );
};

export default ResultActions;
