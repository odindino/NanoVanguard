import { defineStore } from 'pinia';

export interface STSScript {
  name: string;
  vds_list: number[];
  vg_list: number[];
  created_time?: string;
}

interface STSState {
  scripts: Record<string, STSScript>;
  selectedScript: string | null;
  isLoading: boolean;
}

export const useSTSStore = defineStore('sts', {
  state: (): STSState => ({
    scripts: {},
    selectedScript: null,
    isLoading: false
  }),
  
  getters: {
    currentScript: (state) => {
      if (!state.selectedScript) return null;
      return state.scripts[state.selectedScript] || null;
    },
    
    scriptsList: (state) => {
      return Object.values(state.scripts);
    }
  },
  
  actions: {
    async loadScripts() {
      this.isLoading = true;
      
      try {
        const scripts = await window.pywebview.api.get_sts_scripts();
        this.scripts = scripts || {};
        return this.scripts;
      } catch (error) {
        console.error('載入 STS 腳本錯誤:', error);
        throw error;
      } finally {
        this.isLoading = false;
      }
    },
    
    async saveScript(name: string, vdsList: number[], vgList: number[]) {
      this.isLoading = true;
      
      try {
        await window.pywebview.api.save_sts_script(name, vdsList, vgList);
        
        // 重新載入腳本以獲取更新後的腳本列表
        await this.loadScripts();
        
        // 設置當前選中的腳本
        this.selectedScript = name;
        
        return true;
      } catch (error) {
        console.error('儲存 STS 腳本錯誤:', error);
        throw error;
      } finally {
        this.isLoading = false;
      }
    },
    
    selectScript(scriptName: string) {
      if (this.scripts[scriptName]) {
        this.selectedScript = scriptName;
        return true;
      }
      return false;
    },
    
    clearSelectedScript() {
      this.selectedScript = null;
    },
    
    async startSTSMeasurement() {
      try {
        return await window.pywebview.api.start_sts();
      } catch (error) {
        console.error('開始 STS 測量錯誤:', error);
        throw error;
      }
    },
    
    async startMultiSTSMeasurement(scriptName?: string) {
      const scriptToUse = scriptName || this.selectedScript;
      
      if (!scriptToUse) {
        throw new Error('未選擇 STS 腳本');
      }
      
      try {
        return await window.pywebview.api.perform_multi_sts(scriptToUse);
      } catch (error) {
        console.error('開始多重 STS 測量錯誤:', error);
        throw error;
      }
    }
  }
});