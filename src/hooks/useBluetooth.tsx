
import React, { useState, useEffect, createContext, useContext, ReactNode } from "react";
import { BluetoothDevice, EnvData } from "@/types";
import { useToast } from "@/hooks/use-toast";

// Bluetooth state type
export type BluetoothState = 'available' | 'disabled' | 'unavailable' | 'noDevices';

// Default environment data values
const defaultEnvData: EnvData = {
  soilMoisture: 65,
  soilTemperature: 22,
  soilPh: 6.5,
  airTemperature: 25,
  airHumidity: 70,
  timestamp: new Date()
};

interface BluetoothContextType {
  isBluetoothConnected: boolean;
  bluetoothDevices: BluetoothDevice[];
  connectToDevice: (deviceId: string) => Promise<boolean>;
  disconnectDevice: () => void;
  scanForDevices: () => Promise<void>;
  envData: EnvData | null;
  manualEnvDataMode: boolean;
  setManualEnvDataMode: (mode: boolean) => void;
  manualEnvData: EnvData;
  updateManualEnvData: (field: keyof EnvData, value: number) => void;
  bluetoothState: BluetoothState;
}

const BluetoothContext = createContext<BluetoothContextType | undefined>(undefined);

export const BluetoothProvider: React.FC<{children: ReactNode}> = ({ children }) => {
  const [isBluetoothConnected, setIsBluetoothConnected] = useState(false);
  const [bluetoothDevices, setBluetoothDevices] = useState<BluetoothDevice[]>([]);
  const [envData, setEnvData] = useState<EnvData | null>(null);
  const [manualEnvDataMode, setManualEnvDataMode] = useState(false);
  const [manualEnvData, setManualEnvData] = useState<EnvData>({...defaultEnvData});
  const [bluetoothState, setBluetoothState] = useState<BluetoothState>('available');
  const { toast } = useToast();

  // Check bluetooth availability on mount
  useEffect(() => {
    const checkBluetoothAvailability = async () => {
      try {
        if (!navigator.bluetooth) {
          setBluetoothState('unavailable');
          return;
        }
        
        // Try to get bluetooth availability
        const available = await navigator.bluetooth.getAvailability();
        if (!available) {
          setBluetoothState('disabled');
          return;
        }
        
        setBluetoothState('available');
      } catch (error) {
        console.error("Error checking Bluetooth availability:", error);
        setBluetoothState('unavailable');
      }
    };
    
    checkBluetoothAvailability();
  }, []);

  // Update manual environment data
  const updateManualEnvData = (field: keyof EnvData, value: number) => {
    setManualEnvData(prev => ({
      ...prev,
      [field]: value,
      timestamp: new Date()
    }));
  };

  // Scan for bluetooth devices
  const scanForDevices = async (): Promise<void> => {
    console.log("Scanning for Bluetooth devices...");
    
    try {
      // Check if Web Bluetooth is supported
      if (!navigator.bluetooth) {
        setBluetoothState('unavailable');
        toast({
          title: "不支持蓝牙",
          description: "您的浏览器不支持Web Bluetooth API，请使用手动输入模式。",
          variant: "destructive"
        });
        // Auto switch to manual mode
        setManualEnvDataMode(true);
        return;
      }

      // Check if Bluetooth is enabled
      const available = await navigator.bluetooth.getAvailability();
      if (!available) {
        setBluetoothState('disabled');
        toast({
          title: "蓝牙已禁用",
          description: "请开启设备蓝牙功能后再尝试扫描，或使用手动输入模式。",
          variant: "destructive"
        });
        // Auto switch to manual mode
        setManualEnvDataMode(true);
        return;
      }

      // Request Bluetooth device
      const device = await navigator.bluetooth.requestDevice({
        filters: [
          // Add filters for specific devices
          { namePrefix: "qiongshuAI" },
          // Include other common Bluetooth device prefixes for soil sensors
          { namePrefix: "Soil" },
          { namePrefix: "BLE" },
          { namePrefix: "HC" }
        ],
        // Optional services to access
        optionalServices: ['battery_service', 'device_information']
      });

      // Create device object
      const discoveredDevice: BluetoothDevice = {
        id: device.id,
        name: device.name || "未知设备",
        connected: false
      };

      // Check if device is already in the list
      setBluetoothDevices(prev => {
        const exists = prev.some(d => d.id === discoveredDevice.id);
        if (exists) {
          return prev.map(d => d.id === discoveredDevice.id ? discoveredDevice : d);
        } else {
          return [...prev, discoveredDevice];
        }
      });

      setBluetoothState('available');
      
      toast({
        title: "发现设备",
        description: `已发现: ${device.name || "未知设备"}`
      });

    } catch (error) {
      console.error("Bluetooth scan error:", error);
      
      // If user cancelled the Bluetooth request
      if ((error as Error).name === 'NotFoundError') {
        setBluetoothState('noDevices');
        toast({
          title: "未选择设备",
          description: "未检测到蓝牙设备，已切换到手动输入模式。",
        });
        // Auto switch to manual mode
        setManualEnvDataMode(true);
      } else if ((error as Error).name === 'SecurityError' || (error as Error).message?.includes('User denied permission')) {
        setBluetoothState('disabled');
        toast({
          title: "权限不足",
          description: "请允许蓝牙权限，或使用手动输入模式。",
          variant: "destructive"
        });
        // Auto switch to manual mode
        setManualEnvDataMode(true);
      } else {
        toast({
          title: "扫描失败",
          description: "无法扫描蓝牙设备，请确保蓝牙已启用或使用手动输入模式。",
          variant: "destructive"
        });
        // Auto switch to manual mode
        setManualEnvDataMode(true);
      }
    }
  };

  const connectToDevice = async (deviceId: string): Promise<boolean> => {
    console.log(`Connecting to device ${deviceId}...`);
    
    try {
      // Find the device
      const deviceToConnect = bluetoothDevices.find(d => d.id === deviceId);
      if (!deviceToConnect) {
        throw new Error("Device not found");
      }

      // Request Bluetooth device by ID (this is not directly supported by Web Bluetooth API,
      // we would normally need to scan again, but for demonstration purposes we'll simulate it)
      const device = await navigator.bluetooth.requestDevice({
        filters: [{ name: deviceToConnect.name }],
        optionalServices: ['battery_service', 'device_information']
      });

      // Connect to the GATT server
      const server = await device.gatt?.connect();
      if (!server) {
        throw new Error("Failed to connect to GATT server");
      }

      // Update device connection status
      setBluetoothDevices(prev => 
        prev.map(device => 
          device.id === deviceId 
            ? { ...device, connected: true } 
            : { ...device, connected: false }
        )
      );
      
      setIsBluetoothConnected(true);
      
      // In a real implementation, you would read characteristic values here
      // For demonstration, we'll create simulated data based on device type
      const isQiongshuDevice = deviceToConnect.name.includes("qiongshuAI");
      
      // Simulated environment data
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
      
      // Set up listeners for disconnection
      device.addEventListener('gattserverdisconnected', () => {
        disconnectDevice();
        toast({
          title: "设备已断开",
          description: "蓝牙连接已断开",
          variant: "destructive"
        });
      });
      
      return true;
    } catch (error) {
      console.error("Bluetooth connection error:", error);
      toast({
        title: "连接失败",
        description: "无法连接到蓝牙设备，请确保设备在范围内且已打开。",
        variant: "destructive"
      });
      return false;
    }
  };

  const disconnectDevice = () => {
    setBluetoothDevices(prev => 
      prev.map(device => ({ ...device, connected: false }))
    );
    setIsBluetoothConnected(false);
    setEnvData(null);
  };

  // Get the correct environment data based on mode
  const getActiveEnvData = () => manualEnvDataMode ? manualEnvData : envData;

  return (
    <BluetoothContext.Provider value={{
      isBluetoothConnected,
      bluetoothDevices,
      connectToDevice,
      disconnectDevice,
      scanForDevices,
      envData: getActiveEnvData(),
      manualEnvDataMode,
      setManualEnvDataMode,
      manualEnvData,
      updateManualEnvData,
      bluetoothState
    }}>
      {children}
    </BluetoothContext.Provider>
  );
};

export const useBluetooth = () => {
  const context = useContext(BluetoothContext);
  if (context === undefined) {
    throw new Error("useBluetooth must be used within a BluetoothProvider");
  }
  return context;
};
