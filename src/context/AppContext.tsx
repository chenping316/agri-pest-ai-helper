
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { AnalysisMode, DiagnosisResult, HistoryRecord, User, PlantType } from "@/types";
import { BluetoothProvider, useBluetooth } from "@/hooks/useBluetooth";

interface AppContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoggedIn: boolean;
  analysisMode: AnalysisMode;
  setAnalysisMode: (mode: AnalysisMode) => void;
  history: HistoryRecord[];
  addToHistory: (record: Omit<HistoryRecord, "id" | "timestamp">) => void;
  capturedImage: string | null;
  setCapturedImage: (image: string | null) => void;
  diagnosisResult: DiagnosisResult | null;
  setDiagnosisResult: (result: DiagnosisResult | null) => void;
  isAnalyzing: boolean;
  setIsAnalyzing: (analyzing: boolean) => void;
  appReady: boolean;
  setAppReady: (ready: boolean) => void;
  selectedPlantType: string | null;
  setSelectedPlantType: (plantType: string | null) => void;
  availablePlantTypes: PlantType[];
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Empty history array (no mock data)
const emptyHistoryData: HistoryRecord[] = [];

// Common plant types in China
const commonPlantTypes: PlantType[] = [
  { id: "rice", name: "水稻", category: "谷物" },
  { id: "wheat", name: "小麦", category: "谷物" },
  { id: "corn", name: "玉米", category: "谷物" },
  { id: "soybean", name: "大豆", category: "豆类" },
  { id: "cotton", name: "棉花", category: "经济作物" },
  { id: "rapeseed", name: "油菜", category: "油料作物" },
  { id: "potato", name: "马铃薯", category: "块茎类" },
  { id: "sweetpotato", name: "红薯", category: "块茎类" },
  { id: "tomato", name: "番茄", category: "蔬菜" },
  { id: "cucumber", name: "黄瓜", category: "蔬菜" },
  { id: "eggplant", name: "茄子", category: "蔬菜" },
  { id: "pepper", name: "辣椒", category: "蔬菜" },
  { id: "cabbage", name: "白菜", category: "蔬菜" },
  { id: "lettuce", name: "生菜", category: "蔬菜" },
  { id: "apple", name: "苹果", category: "水果" },
  { id: "pear", name: "梨", category: "水果" },
  { id: "orange", name: "橙子", category: "水果" },
  { id: "grape", name: "葡萄", category: "水果" },
  { id: "tea", name: "茶", category: "经济作物" }
];

// App provider component that includes Bluetooth provider
export const AppProvider: React.FC<{children: ReactNode}> = ({ children }) => {
  return (
    <BluetoothProvider>
      <AppContextProvider>{children}</AppContextProvider>
    </BluetoothProvider>
  );
};

// Internal App context provider
const AppContextProvider: React.FC<{children: ReactNode}> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [analysisMode, setAnalysisMode] = useState<AnalysisMode>("image-only");
  const [history, setHistory] = useState<HistoryRecord[]>(emptyHistoryData);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [diagnosisResult, setDiagnosisResult] = useState<DiagnosisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [appReady, setAppReady] = useState(false);
  const [selectedPlantType, setSelectedPlantType] = useState<string | null>(null);
  const [availablePlantTypes] = useState<PlantType[]>(commonPlantTypes);

  // Check for saved login
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    
    // Simulate app initialization
    const timer = setTimeout(() => {
      setAppReady(true);
    }, 3000);
    
    return () => clearTimeout(timer);
  }, []);

  // Login function
  const login = async (username: string, password: string): Promise<boolean> => {
    if (username && password) {
      const newUser: User = {
        id: Date.now().toString(),
        username,
        name: username
      };
      
      setUser(newUser);
      localStorage.setItem("user", JSON.stringify(newUser));
      return true;
    }
    return false;
  };

  // Logout function
  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
  };

  // History management
  const addToHistory = (record: Omit<HistoryRecord, "id" | "timestamp">) => {
    const newRecord: HistoryRecord = {
      ...record,
      id: Date.now().toString(),
      timestamp: new Date()
    };
    
    setHistory(prev => [newRecord, ...prev]);
  };

  return (
    <AppContext.Provider value={{
      user,
      login,
      logout,
      isLoggedIn: !!user,
      analysisMode,
      setAnalysisMode,
      history,
      addToHistory,
      capturedImage,
      setCapturedImage,
      diagnosisResult,
      setDiagnosisResult,
      isAnalyzing,
      setIsAnalyzing,
      appReady,
      setAppReady,
      selectedPlantType,
      setSelectedPlantType,
      availablePlantTypes
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  
  // Get Bluetooth context and merge with app context
  const bluetooth = useBluetooth();
  
  return {
    ...context,
    ...bluetooth
  };
};
