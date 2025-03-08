
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
  appReady: boolean;
  setAppReady: (ready: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Empty history array (no mock data)
const emptyHistoryData: HistoryRecord[] = [];

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
      setIsAnalyzing,
      appReady,
      setAppReady
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
