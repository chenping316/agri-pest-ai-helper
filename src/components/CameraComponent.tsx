
import React, { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Camera, FlipHorizontal, Image } from "lucide-react";
import { useAppContext } from "@/context/AppContext";

interface CameraComponentProps {
  onCapture: (imageUrl: string) => void;
}

const CameraComponent: React.FC<CameraComponentProps> = ({ onCapture }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [useFrontCamera, setUseFrontCamera] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  
  const startCamera = async () => {
    try {
      if (!videoRef.current) return;
      
      const facingMode = useFrontCamera ? "user" : "environment";
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode }
      });
      
      videoRef.current.srcObject = stream;
      setIsCameraActive(true);
    } catch (error) {
      console.error("Error accessing camera:", error);
      toast({
        title: "相机错误",
        description: "无法访问相机，请检查相机权限或使用图片上传功能。",
        variant: "destructive"
      });
    }
  };

  const stopCamera = () => {
    if (!videoRef.current || !videoRef.current.srcObject) return;
    
    const stream = videoRef.current.srcObject as MediaStream;
    const tracks = stream.getTracks();
    
    tracks.forEach(track => track.stop());
    videoRef.current.srcObject = null;
    setIsCameraActive(false);
  };

  const captureImage = () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const context = canvas.getContext("2d");
    if (!context) return;
    
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    const imageUrl = canvas.toDataURL("image/jpeg");
    setSelectedImage(imageUrl);
    stopCamera();
  };

  const toggleCamera = () => {
    if (isCameraActive) {
      stopCamera();
    } else {
      startCamera();
    }
  };

  const switchCamera = () => {
    stopCamera();
    setUseFrontCamera(!useFrontCamera);
    setTimeout(startCamera, 300);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const imageUrl = e.target?.result as string;
      setSelectedImage(imageUrl);
    };
    reader.readAsDataURL(file);
  };

  const openFileSelector = () => {
    fileInputRef.current?.click();
  };

  const confirmImage = () => {
    if (selectedImage) {
      onCapture(selectedImage);
    }
  };

  const cancelImage = () => {
    setSelectedImage(null);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (isCameraActive) {
        stopCamera();
      }
    };
  }, [isCameraActive]);

  return (
    <div className="flex flex-col items-center space-y-4">
      {/* Hidden file input */}
      <input
        type="file"
        accept="image/*"
        className="hidden"
        ref={fileInputRef}
        onChange={handleFileSelect}
      />
      
      {/* Camera preview or selected image */}
      <div className="relative w-full aspect-[4/3] bg-black rounded-lg overflow-hidden">
        {selectedImage ? (
          <img 
            src={selectedImage} 
            alt="Captured" 
            className="w-full h-full object-contain"
          />
        ) : (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className={`w-full h-full object-cover ${isCameraActive ? 'block' : 'hidden'}`}
          />
        )}
        
        {(!isCameraActive && !selectedImage) && (
          <div className="absolute inset-0 flex items-center justify-center bg-muted">
            <p className="text-muted-foreground">请启动相机或上传图片</p>
          </div>
        )}
        
        {/* Hidden canvas for capturing */}
        <canvas ref={canvasRef} className="hidden" />
      </div>
      
      {/* Camera controls */}
      <div className="flex flex-wrap justify-center gap-3">
        {!selectedImage ? (
          <>
            <Button onClick={toggleCamera} variant="outline" size="lg">
              <Camera className="mr-2 h-4 w-4" />
              {isCameraActive ? "关闭相机" : "打开相机"}
            </Button>
            
            {isCameraActive && (
              <Button onClick={switchCamera} variant="outline" size="lg">
                <FlipHorizontal className="mr-2 h-4 w-4" />
                切换相机
              </Button>
            )}
            
            <Button onClick={openFileSelector} variant="outline" size="lg">
              <Image className="mr-2 h-4 w-4" />
              选择图片
            </Button>
            
            {isCameraActive && (
              <Button onClick={captureImage} size="lg" className="bg-primary hover:bg-primary/90">
                拍照
              </Button>
            )}
          </>
        ) : (
          <>
            <Button onClick={cancelImage} variant="outline" size="lg">
              取消
            </Button>
            <Button onClick={confirmImage} size="lg" className="bg-primary hover:bg-primary/90">
              确认使用
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export default CameraComponent;
