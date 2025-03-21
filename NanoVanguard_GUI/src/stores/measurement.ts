import { defineStore } from 'pinia';

export type MeasurementType = 'sts' | 'cits' | 'auto-move';

export interface MeasurementResult {
  type: MeasurementType;
  startTime: number;
  endTime: number;
  duration: number;
  success: boolean;
  data?: any;
}

interface MeasurementState {
  isRunning: boolean;
  isConnected: boolean;
  currentType: MeasurementType | null;
  startTime: number | null;
  progress: number;
  lastMeasurement: MeasurementResult | null;
  error: string | null;
}

export const useMeasurementStore = defineStore('measurement', {
  state: (): MeasurementState => ({
    isRunning: false,
    isConnected: false,
    currentType: null,
    startTime: null,
    progress: 0,
    lastMeasurement: null,
    error: null,
  }),
  
  actions: {
    async startMeasurement(type: MeasurementType) {
      if (this.isRunning) return;
      
      this.isRunning = true;
      this.currentType = type;
      this.startTime = Date.now();
      this.progress = 0;
      this.error = null;
      
      try {
        // 根據測量類型呼叫不同的 Python API 方法
        switch (type) {
          case 'sts':
            await window.pywebview.api.start_sts();
            break;
          case 'cits':
            await window.pywebview.api.start_ssts_cits();
            break;
          case 'auto-move':
            await window.pywebview.api.auto_move_scan_area();
            break;
        }
        
        // 成功完成測量
        this.completeMeasurement(true);
      } catch (error) {
        // 測量過程出錯
        this.error = error instanceof Error ? error.message : '未知錯誤';
        this.completeMeasurement(false);
        throw error;
      }
    },
    
    updateProgress(progress: number) {
      this.progress = Math.min(Math.max(progress, 0), 100);
    },
    
    setRunningState(isRunning: boolean) {
      this.isRunning = isRunning;
      if (!isRunning) {
        this.progress = 0;
      }
    },
    
    setConnectionState(isConnected: boolean) {
      this.isConnected = isConnected;
    },
    
    completeMeasurement(success: boolean) {
      if (!this.startTime || !this.currentType) return;
      
      const endTime = Date.now();
      const duration = endTime - this.startTime;
      
      this.lastMeasurement = {
        type: this.currentType,
        startTime: this.startTime,
        endTime,
        duration,
        success
      };
      
      this.isRunning = false;
      this.currentType = null;
      this.startTime = null;
      this.progress = 0;
    },
    
    clearError() {
      this.error = null;
    }
  }
});