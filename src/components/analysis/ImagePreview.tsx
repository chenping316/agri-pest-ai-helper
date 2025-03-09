
import React from "react";
import { Button } from "@/components/ui/button";
import { Image } from "lucide-react";

interface ImagePreviewProps {
  capturedImage: string | null;
  resetAnalysis: () => void;
  performAnalysis: () => void;
}

const ImagePreview: React.FC<ImagePreviewProps> = ({
  capturedImage,
  resetAnalysis,
  performAnalysis,
}) => {
  if (!capturedImage) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Image className="h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-muted-foreground mb-2">未检测到图片</p>
        <p className="text-sm text-muted-foreground">
          请先拍摄或上传植物照片
        </p>
      </div>
    );
  }

  return (
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
  );
};

export default ImagePreview;
