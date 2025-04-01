import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { AnalysisMode, BluetoothDevice, DiagnosisResult, EnvData, HistoryRecord, User, PlantType } from "@/types";

interface AppContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoggedIn: boolean;
  analysisMode: AnalysisMode;
  setAnalysisMode: (mode: AnalysisMode) => void;
  envData: EnvData | null;
  isBluetoothConnected: boolean;
  bluetoothDevices: BluetoothDevice[];
  connectToDevice: (deviceId: string) => Promise<boolean>;
  disconnectDevice: () => void;
  scanForDevices: () => Promise<void>;
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
  manualEnvDataMode: boolean;
  setManualEnvDataMode: (mode: boolean) => void;
  manualEnvData: EnvData;
  updateManualEnvData: (field: keyof EnvData, value: number) => void;
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

// Default environment data values
const defaultEnvData: EnvData = {
  soilMoisture: 65,
  soilTemperature: 22,
  soilPh: 6.5,
  airTemperature: 25,
  airHumidity: 70,
  timestamp: new Date()
};

export const AppProvider: React.FC<{children: ReactNode}> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [analysisMode, setAnalysisMode] = useState<AnalysisMode>("image-only");
  const [envData, setEnvData] = useState<EnvData | null>(null);
  const [isBluetoothConnected, setIsBluetoothConnected] = useState(false);
  const [bluetoothDevices, setBluetoothDevices] = useState<BluetoothDevice[]>([]);
  const [history, setHistory] = useState<HistoryRecord[]>(emptyHistoryData);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [diagnosisResult, setDiagnosisResult] = useState<DiagnosisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [appReady, setAppReady] = useState(false);
  const [selectedPlantType, setSelectedPlantType] = useState<string | null>(null);
  const [availablePlantTypes] = useState<PlantType[]>(commonPlantTypes);
  const [manualEnvDataMode, setManualEnvDataMode] = useState(false);
  const [manualEnvData, setManualEnvData] = useState<EnvData>({...defaultEnvData});

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

  // Update manual environment data
  const updateManualEnvData = (field: keyof EnvData, value: number) => {
    setManualEnvData(prev => ({
      ...prev,
      [field]: value,
      timestamp: new Date()
    }));
  };

  // Mock Bluetooth functions
  const scanForDevices = async (): Promise<void> => {
    console.log("Scanning for Bluetooth devices...");
    // In a real app, this would use the Web Bluetooth API
    
    // Mock data for testing, including the qiongshuAI device
    const mockDevices: BluetoothDevice[] = [
      { id: "device1", name: "qiongshuAI传感器", connected: false },
      { id: "device2", name: "土壤检测仪A", connected: false },
      { id: "device3", name: "土壤检测仪B", connected: false },
      { id: "device4", name: "环境监测器", connected: false }
    ];
    
    setBluetoothDevices(mockDevices);
  };

  const connectToDevice = async (deviceId: string): Promise<boolean> => {
    console.log(`Connecting to device ${deviceId}...`);
    // In a real app, this would use the Web Bluetooth API
    
    const device = bluetoothDevices.find(d => d.id === deviceId);
    const isQiongshuDevice = device?.name.includes("qiongshuAI");
    
    // Mock connection
    setBluetoothDevices(prev => 
      prev.map(device => 
        device.id === deviceId 
          ? { ...device, connected: true } 
          : { ...device, connected: false }
      )
    );
    
    setIsBluetoothConnected(true);
    
    // Simulate receiving environmental data
    const mockEnvData: EnvData = {
      soilMoisture: Math.floor(Math.random() * 100),
      soilTemperature: 15 + Math.random() * 15,
      soilPh: 5 + Math.random() * 3,
      airTemperature: 15 + Math.random() * 20,
      airHumidity: 40 + Math.random() * 60,
      timestamp: new Date()
    };
    
    // If it's a qiongshuAI device, use specific optimized data
    if (isQiongshuDevice) {
      mockEnvData.soilMoisture = 75 + Math.random() * 10; // Higher moisture
      mockEnvData.soilPh = 6.2 + Math.random() * 0.5; // Optimal pH range
    }
    
    setEnvData(mockEnvData);
    return true;
  };

  const disconnectDevice = () => {
    setBluetoothDevices(prev => 
      prev.map(device => ({ ...device, connected: false }))
    );
    setIsBluetoothConnected(false);
    setEnvData(null);
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

  // Get the correct environment data based on mode
  const getActiveEnvData = () => manualEnvDataMode ? manualEnvData : envData;

  return (
    <AppContext.Provider value={{
      user,
      login,
      logout,
      isLoggedIn: !!user,
      analysisMode,
      setAnalysisMode,
      envData: getActiveEnvData(),
      isBluetoothConnected,
      bluetoothDevices,
      connectToDevice,
      disconnectDevice,
      scanForDevices,
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
      availablePlantTypes,
      manualEnvDataMode,
      setManualEnvDataMode,
      manualEnvData,
      updateManualEnvData
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
  return context;
};
