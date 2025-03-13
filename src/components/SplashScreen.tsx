
import React from "react";
import { motion } from "framer-motion";
import { useAppContext } from "@/context/AppContext";
import { Sprout, Leaf, Cpu } from "lucide-react";

const SplashScreen: React.FC = () => {
  const { appReady } = useAppContext();
  
  return (
    <motion.div
      className="fixed inset-0 bg-gradient-to-b from-primary/90 to-primary/60 flex flex-col items-center justify-center z-50"
      initial={{ opacity: 1 }}
      animate={{ 
        opacity: appReady ? 0 : 1,
        pointerEvents: appReady ? "none" : "auto" 
      }}
      transition={{ duration: 0.8, ease: "easeInOut" }}
    >
      <motion.div 
        className="flex flex-col items-center"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        <motion.div
          className="bg-white rounded-full p-6 mb-4 shadow-lg"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ 
            type: "spring", 
            stiffness: 260, 
            damping: 20,
            delay: 0.5
          }}
        >
          <Leaf className="h-16 w-16 text-primary" />
        </motion.div>
        
        <motion.h1
          className="text-3xl font-bold text-white mb-2 tracking-tight"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.9 }}
        >
          穹枢科技
        </motion.h1>
        
        <motion.div
          className="flex items-center justify-center gap-2 mb-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1.2 }}
        >
          <Sprout className="h-4 w-4 text-green-200" />
          <p className="text-white text-sm font-medium">农业病虫害AI检测系统</p>
          <Sprout className="h-4 w-4 text-green-200" />
        </motion.div>
        
        <motion.div
          className="flex items-center justify-center gap-1.5 mb-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1.5 }}
        >
          <Cpu className="h-3.5 w-3.5 text-blue-200" />
          <p className="text-white/90 text-xs font-medium">多模型分析 | 混合诊断能力</p>
          <Cpu className="h-3.5 w-3.5 text-blue-200" />
        </motion.div>
        
        <motion.p
          className="text-center text-white/80 text-sm max-w-xs"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1.8 }}
        >
          杭州穹枢科技有限公司
        </motion.p>
      </motion.div>
      
      <motion.div
        className="absolute bottom-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 2.1 }}
      >
        <svg className="w-8 h-8 text-white animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </motion.div>
    </motion.div>
  );
};

export default SplashScreen;
