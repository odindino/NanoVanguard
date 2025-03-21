import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import '@/style.css';

// 創建 Vue 應用實例
const app = createApp(App);

// 註冊 Pinia
const pinia = createPinia();
app.use(pinia);

// 全局 PyWebView API 型別定義
declare global {
  interface Window {
    pywebview: {
      api: {
        // SMU 相關方法
        connect_smu: (address: string) => Promise<boolean>;
        disconnect_smu: () => Promise<boolean>;
        set_channel_value: (channel: number, mode: string, value: number) => Promise<boolean>;
        set_channel_output: (channel: number, state: boolean) => Promise<boolean>;
        read_channel: (channel: number) => Promise<{ voltage: number; current: number }>;
        set_compliance: (channel: number, value: number) => Promise<boolean>;
        
        // STS 相關方法
        get_sts_scripts: () => Promise<Record<string, any>>;
        save_sts_script: (name: string, vdsList: number[], vgList: number[]) => Promise<boolean>;
        start_sts: () => Promise<boolean>;
        perform_multi_sts: (scriptName: string) => Promise<boolean>;
        
        // CITS 相關方法
        start_ssts_cits: (pointsX: number, pointsY: number, scanDirection: number) => Promise<boolean>;
        start_msts_cits: (pointsX: number, pointsY: number, scriptName: string, scanDirection: number) => Promise<boolean>;
        start_local_ssts_cits: (localAreas: any[], direction: number, settings?: any) => Promise<boolean>;
        start_local_msts_cits: (localAreas: any[], scriptName: string, direction: number, settings?: any) => Promise<boolean>;
        preview_local_cits: (params: any) => Promise<any>;
        get_local_cits_area_scripts: () => Promise<Record<string, any>>;
        save_local_cits_area_script: (scriptData: any) => Promise<boolean>;
        
        // Auto-Move 相關方法
        get_auto_move_scripts: () => Promise<Record<string, any>>;
        save_auto_move_script: (scriptData: any) => Promise<boolean>;
        preview_auto_move: (params: any) => Promise<any>;
        auto_move_scan_area: (script?: string, distance?: number, waitTime?: number, repeatCount?: number) => Promise<boolean>;
        auto_move_ssts_cits: (script: string, distance: number, waitTime: number, repeatCount: number) => Promise<boolean>;
        auto_move_msts_cits: (script: string, distance: number, stsScript: string, waitTime: number, repeatCount: number) => Promise<boolean>;
        auto_move_local_ssts_cits: (script: string, distance: number, areas: any[], waitTime: number, repeatCount: number) => Promise<boolean>;
        auto_move_local_msts_cits: (script: string, distance: number, areas: any[], stsScript: string, waitTime: number, repeatCount: number) => Promise<boolean>;
        
        // SXM 狀態相關
        get_sxm_status: () => Promise<any>;
        stop_measurement: () => Promise<boolean>;
      }
    }
  }
}

// 錯誤處理
app.config.errorHandler = (err, vm, info) => {
  console.error('Vue 錯誤:', err);
  console.error('錯誤信息:', info);
};

// 開發環境警告
if (import.meta.env.DEV) {
  app.config.warnHandler = (msg, vm, trace) => {
    console.warn('Vue 警告:', msg);
    console.warn('追蹤:', trace);
  };
}

// 掛載應用
app.mount('#app');