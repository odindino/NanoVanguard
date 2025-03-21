import { defineStore } from 'pinia';

export interface MoveScript {
  name: string;
  script: string;
  distance: number;
  waitTime: number;
  repeatCount: number;
  created_time?: string;
}

export interface PreviewData {
  data: any[];
  layout: any;
}

interface AutoMoveState {
  scripts: Record<string, MoveScript>;
  selectedScript: string | null;
  
  currentScript: {
    name: string;
    script: string;
    distance: number;
    waitTime: number;
    repeatCount: number;
  };
  
  previewData: PreviewData | null;
  isLoading: boolean;
}

export const useAutoMoveStore = defineStore('automove', {
  state: (): AutoMoveState => ({
    scripts: {},
    selectedScript: null,
    
    currentScript: {
      name: '',
      script: '',
      distance: 200,
      waitTime: 1.0,
      repeatCount: 1
    },
    
    previewData: null,
    isLoading: false
  }),
  
  getters: {
    currentScriptData: (state) => {
      if (!state.selectedScript) return state.currentScript;
      return state.scripts[state.selectedScript] || state.currentScript;
    },
    
    scriptsList: (state) => {
      return Object.values(state.scripts);
    }
  },
  
  actions: {
    async loadScripts() {
      this.isLoading = true;
      
      try {
        const scripts = await window.pywebview.api.get_auto_move_scripts();
        this.scripts = scripts || {};
        return this.scripts;
      } catch (error) {
        console.error('載入自動移動腳本錯誤:', error);
        throw error;
      } finally {
        this.isLoading = false;
      }
    },
    
    async saveScript(scriptData: Omit<MoveScript, 'created_time'>) {
      this.isLoading = true;
      
      try {
        const success = await window.pywebview.api.save_auto_move_script(scriptData);
        
        if (success) {
          // 重新載入腳本以獲取更新後的腳本列表
          await this.loadScripts();
          
          // 設置當前選中的腳本
          this.selectedScript = scriptData.name;
          
          // 更新當前腳本資料
          this.currentScript = { ...scriptData };
        }
        
        return success;
      } catch (error) {
        console.error('儲存自動移動腳本錯誤:', error);
        throw error;
      } finally {
        this.isLoading = false;
      }
    },
    
    selectScript(scriptName: string) {
      if (this.scripts[scriptName]) {
        this.selectedScript = scriptName;
        
        // 更新當前腳本資料
        const script = this.scripts[scriptName];
        this.currentScript = {
          name: script.name,
          script: script.script,
          distance: script.distance,
          waitTime: script.waitTime,
          repeatCount: script.repeatCount
        };
        
        return true;
      }
      return false;
    },
    
    clearSelectedScript() {
      this.selectedScript = null;
      
      // 重置當前腳本資料
      this.currentScript = {
        name: '',
        script: '',
        distance: 200,
        waitTime: 1.0,
        repeatCount: 1
      };
    },
    
    updateCurrentScript(data: Partial<typeof this.currentScript>) {
      this.currentScript = { ...this.currentScript, ...data };
    },
    
    async generatePreview(params?: { center_x?: number; center_y?: number; angle?: number }) {
      this.isLoading = true;
      
      try {
        const previewParams = {
          movement_script: this.currentScript.script,
          distance: this.currentScript.distance,
          center_x: params?.center_x || null,
          center_y: params?.center_y || null,
          angle: params?.angle || null
        };
        
        const preview = await window.pywebview.api.preview_auto_move(previewParams);
        
        this.previewData = preview;
        return preview;
      } catch (error) {
        console.error('生成自動移動預覽錯誤:', error);
        throw error;
      } finally {
        this.isLoading = false;
      }
    },
    
    async startAutoMoveScan() {
      try {
        return await window.pywebview.api.auto_move_scan_area(
          this.currentScript.script,
          this.currentScript.distance,
          this.currentScript.waitTime,
          this.currentScript.repeatCount
        );
      } catch (error) {
        console.error('開始自動移動掃描錯誤:', error);
        throw error;
      }
    },
    
    async startAutoMoveSingleSTS() {
      try {
        return await window.pywebview.api.auto_move_ssts_cits(
          this.currentScript.script,
          this.currentScript.distance,
          this.currentScript.waitTime,
          this.currentScript.repeatCount
        );
      } catch (error) {
        console.error('開始自動移動單一 STS CITS 錯誤:', error);
        throw error;
      }
    },
    
    async startAutoMoveMultiSTS(scriptName: string) {
      try {
        return await window.pywebview.api.auto_move_msts_cits(
          this.currentScript.script,
          this.currentScript.distance,
          scriptName,
          this.currentScript.waitTime,
          this.currentScript.repeatCount
        );
      } catch (error) {
        console.error('開始自動移動多重 STS CITS 錯誤:', error);
        throw error;
      }
    },
    
    async startAutoMoveLocalSingleSTS(areas: any[]) {
      try {
        return await window.pywebview.api.auto_move_local_ssts_cits(
          this.currentScript.script,
          this.currentScript.distance,
          areas,
          this.currentScript.waitTime,
          this.currentScript.repeatCount
        );
      } catch (error) {
        console.error('開始自動移動局部單一 STS CITS 錯誤:', error);
        throw error;
      }
    },
    
    async startAutoMoveLocalMultiSTS(areas: any[], scriptName: string) {
      try {
        return await window.pywebview.api.auto_move_local_msts_cits(
          this.currentScript.script,
          this.currentScript.distance,
          areas,
          scriptName,
          this.currentScript.waitTime,
          this.currentScript.repeatCount
        );
      } catch (error) {
        console.error('開始自動移動局部多重 STS CITS 錯誤:', error);
        throw error;
      }
    }
  }
});