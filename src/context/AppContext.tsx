
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { AnalysisMode, BluetoothDevice, DiagnosisResult, EnvData, HistoryRecord, User } from "@/types";

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
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Mock data for local testing
const mockHistoryData: HistoryRecord[] = [
  {
    id: "1",
    timestamp: new Date(Date.now() - 86400000 * 2), // 2 days ago
    imageUrl: "https://placehold.co/400x300/green/white?text=Sample+Plant",
    diagnosis: {
      name: "稻瘟病",
      description: "稻瘟病是由稻瘟病菌引起的一种常见的水稻疾病，表现为叶片上的褐色病斑和花颈部变黑。",
      confidence: 0.89,
      treatments: [
        {
          method: "喷洒杀菌剂",
          cost: "low",
          effectiveness: "high",
          estimatedPrice: "¥30-50/亩",
          description: "使用代森锰锌或苯菌灵等杀菌剂喷洒，每7-10天一次，连续2-3次。"
        },
        {
          method: "农业措施",
          cost: "low",
          effectiveness: "medium",
          estimatedPrice: "¥0-20/亩",
          description: "保持田间通风，适当控制氮肥使用量，增施钾肥。"
        }
      ]
    }
  },
  {
    id: "2",
    timestamp: new Date(Date.now() - 86400000), // 1 day ago
    imageUrl: "https://placehold.co/400x300/brown/white?text=Diseased+Plant",
    envData: {
      soilMoisture: 45,
      soilTemperature: 22,
      soilPh: 6.5,
      airTemperature: 25,
      airHumidity: 65,
      timestamp: new Date(Date.now() - 86400000)
    },
    diagnosis: {
      name: "蚜虫",
      description: "蚜虫是一种常见的农作物害虫，会吸食植物汁液，导致叶片卷曲，生长缓慢，并传播病毒。",
      confidence: 0.95,
      treatments: [
        {
          method: "生物防治",
          cost: "low",
          effectiveness: "medium",
          estimatedPrice: "¥20-40/亩",
          description: "释放七星瓢虫或寄生蜂等天敌。"
        },
        {
          method: "化学防治",
          cost: "medium",
          effectiveness: "high",
          estimatedPrice: "¥40-60/亩",
          description: "使用吡虫啉或氯氰菊酯等农药喷洒，注意安全使用。"
        }
      ]
    }
  }
];

export const AppProvider: React.FC<{children: ReactNode}> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [analysisMode, setAnalysisMode] = useState<AnalysisMode>("image-only");
  const [envData, setEnvData] = useState<EnvData | null>(null);
  const [isBluetoothConnected, setIsBluetoothConnected] = useState(false);
  const [bluetoothDevices, setBluetoothDevices] = useState<BluetoothDevice[]>([]);
  const [history, setHistory] = useState<HistoryRecord[]>(mockHistoryData);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [diagnosisResult, setDiagnosisResult] = useState<DiagnosisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Check for saved login
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  // Login function
  const login = async (username: string, password: string): Promise<boolean> => {
    // This is a mock implementation - in a real app, this would verify against a database
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

  // Mock Bluetooth functions
  const scanForDevices = async (): Promise<void> => {
    console.log("Scanning for Bluetooth devices...");
    // In a real app, this would use the Web Bluetooth API
    
    // Mock data for testing
    const mockDevices: BluetoothDevice[] = [
      { id: "device1", name: "土壤检测仪A", connected: false },
      { id: "device2", name: "土壤检测仪B", connected: false },
      { id: "device3", name: "环境监测器", connected: false }
    ];
    
    setBluetoothDevices(mockDevices);
  };

  const connectToDevice = async (deviceId: string): Promise<boolean> => {
    console.log(`Connecting to device ${deviceId}...`);
    // In a real app, this would use the Web Bluetooth API
    
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

  return (
    <AppContext.Provider value={{
      user,
      login,
      logout,
      isLoggedIn: !!user,
      analysisMode,
      setAnalysisMode,
      envData,
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
      setIsAnalyzing
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
