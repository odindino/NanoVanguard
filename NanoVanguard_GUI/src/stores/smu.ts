import { defineStore } from 'pinia';
import { useMeasurementStore } from './measurement';

export interface ChannelState {
  outputOn: boolean;
  mode: 'VOLTAGE' | 'CURRENT';
  value: number;
  compliance: number;
  lastReading?: {
    voltage: number;
    current: number;
    timestamp: number;
  }
}

interface SMUState {
  isConnected: boolean;
  visaAddress: string;
  channels: {
    [key: number]: ChannelState;
  };
}

export const useSMUStore = defineStore('smu', {
  state: (): SMUState => ({
    isConnected: false,
    visaAddress: 'TCPIP0::172.30.32.98::inst0::INSTR', // 預設值
    channels: {
      1: { outputOn: false, mode: 'VOLTAGE', value: 0, compliance: 0.01 },
      2: { outputOn: false, mode: 'VOLTAGE', value: 0, compliance: 0.01 }
    }
  }),
  
  actions: {
    async connect(address?: string) {
      try {
        const targetAddress = address || this.visaAddress;
        const success = await window.pywebview.api.connect_smu(targetAddress);
        
        if (success) {
          this.isConnected = true;
          this.visaAddress = targetAddress;
          
          // 更新全局連接狀態
          const measurementStore = useMeasurementStore();
          measurementStore.setConnectionState(true);
          
          return true;
        }
        
        return false;
      } catch (error) {
        console.error('SMU 連接錯誤:', error);
        throw error;
      }
    },
    
    async disconnect() {
      try {
        const success = await window.pywebview.api.disconnect_smu();
        
        if (success) {
          this.isConnected = false;
          
          // 更新通道狀態
          Object.keys(this.channels).forEach(key => {
            const channelKey = Number(key);
            this.channels[channelKey].outputOn = false;
          });
          
          // 更新全局連接狀態
          const measurementStore = useMeasurementStore();
          measurementStore.setConnectionState(false);
          
          return true;
        }
        
        return false;
      } catch (error) {
        console.error('SMU 斷開連接錯誤:', error);
        throw error;
      }
    },
    
    async setChannelValue(channel: number, mode: 'VOLTAGE' | 'CURRENT', value: number) {
      if (!this.isConnected) return false;
      
      try {
        const success = await window.pywebview.api.set_channel_value(
          channel, mode, value
        );
        
        if (success) {
          this.channels[channel].mode = mode;
          this.channels[channel].value = value;
        }
        
        return success;
      } catch (error) {
        console.error('設置通道值錯誤:', error);
        throw error;
      }
    },
    
    async toggleChannelOutput(channel: number) {
      if (!this.isConnected) return false;
      
      try {
        const newState = !this.channels[channel].outputOn;
        const success = await window.pywebview.api.set_channel_output(
          channel, newState
        );
        
        if (success) {
          this.channels[channel].outputOn = newState;
        }
        
        return success;
      } catch (error) {
        console.error('切換通道輸出錯誤:', error);
        throw error;
      }
    },
    
    async readChannelValues(channel: number) {
      if (!this.isConnected) return null;
      
      try {
        const reading = await window.pywebview.api.read_channel(channel);
        
        if (reading) {
          this.channels[channel].lastReading = {
            voltage: reading.voltage,
            current: reading.current,
            timestamp: Date.now()
          };
          
          return this.channels[channel].lastReading;
        }
        
        return null;
      } catch (error) {
        console.error('讀取通道值錯誤:', error);
        throw error;
      }
    },
    
    async setCompliance(channel: number, value: number) {
      if (!this.isConnected) return false;
      
      try {
        const success = await window.pywebview.api.set_compliance(
          channel, value
        );
        
        if (success) {
          this.channels[channel].compliance = value;
        }
        
        return success;
      } catch (error) {
        console.error('設置合規值錯誤:', error);
        throw error;
      }
    }
  }
});