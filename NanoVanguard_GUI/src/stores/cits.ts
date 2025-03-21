import { defineStore } from 'pinia';

export interface LocalArea {
  start_x: number;
  start_y: number;
  dx: number;
  dy: number;
  nx: number;
  ny: number;
  startpoint_direction: 1 | -1;
}

export interface LocalAreaScript {
  name: string;
  areas: LocalArea[];
  description?: string;
  created_time?: string;
}

export interface PreviewSettings {
  center_x: number;
  center_y: number;
  scan_range: number;
  scan_angle: number;
  total_lines: number;
  aspect_ratio: number;
}

export interface PreviewData {
  data: any[];
  layout: any;
  center_x: number;
  center_y: number;
  range: number;
  angle: number;
  total_points: number;
}

interface CITSState {
  // 標準 CITS 設定
  pointsX: number;
  pointsY: number;
  scanDirection: 1 | -1;
  
  // 局部 CITS 設定
  localAreas: LocalArea[];
  globalDirection: 1 | -1;
  
  // 局部區域腳本
  areaScripts: Record<string, LocalAreaScript>;
  selectedAreaScript: string | null;
  
  // 預覽設定
  previewSettings: PreviewSettings;
  previewData: PreviewData | null;
  
  // 背景圖片
  backgroundImage: string | null;
  imageSettings: {
    scale: number;
    opacity: number;
  };
  
  isLoading: boolean;
}

export const useCITSStore = defineStore('cits', {
  state: (): CITSState => ({
    // 標準 CITS 設定
    pointsX: 128,
    pointsY: 128,
    scanDirection: 1,
    
    // 局部 CITS 設定
    localAreas: [createDefaultLocalArea()],
    globalDirection: 1,
    
    // 局部區域腳本
    areaScripts: {},
    selectedAreaScript: null,
    
    // 預覽設定
    previewSettings: {
      center_x: 0,
      center_y: 0,
      scan_range: 100,
      scan_angle: 0,
      total_lines: 500,
      aspect_ratio: 1
    },
    previewData: null,
    
    // 背景圖片
    backgroundImage: null,
    imageSettings: {
      scale: 1.0,
      opacity: 0.5
    },
    
    isLoading: false
  }),
  
  getters: {
    currentAreaScript: (state) => {
      if (!state.selectedAreaScript) return null;
      return state.areaScripts[state.selectedAreaScript] || null;
    },
    
    areaScriptsList: (state) => {
      return Object.values(state.areaScripts);
    },
    
    totalLocalPoints: (state) => {
      return state.localAreas.reduce((sum, area) => sum + area.nx * area.ny, 0);
    }
  },
  
  actions: {
    // CITS 設定更新
    updateCITSSettings(pointsX: number, pointsY: number, scanDirection: 1 | -1) {
      this.pointsX = pointsX;
      this.pointsY = pointsY;
      this.scanDirection = scanDirection;
    },
    
    // 局部區域管理
    addLocalArea() {
      this.localAreas.push(createDefaultLocalArea());
    },
    
    removeLocalArea(index: number) {
      if (this.localAreas.length > 1) {
        this.localAreas.splice(index, 1);
      }
    },
    
    updateLocalArea(index: number, area: Partial<LocalArea>) {
      if (index >= 0 && index < this.localAreas.length) {
        this.localAreas[index] = { ...this.localAreas[index], ...area };
      }
    },
    
    setLocalAreas(areas: LocalArea[]) {
      this.localAreas = areas;
    },
    
    // 局部區域腳本管理
    async loadAreaScripts() {
      this.isLoading = true;
      
      try {
        const scripts = await window.pywebview.api.get_local_cits_area_scripts();
        this.areaScripts = scripts || {};
        return this.areaScripts;
      } catch (error) {
        console.error('載入局部 CITS 區域腳本錯誤:', error);
        throw error;
      } finally {
        this.isLoading = false;
      }
    },
    
    async saveAreaScript(scriptData: Omit<LocalAreaScript, 'created_time'>) {
      this.isLoading = true;
      
      try {
        const success = await window.pywebview.api.save_local_cits_area_script(scriptData);
        
        if (success) {
          // 重新載入腳本以獲取更新後的腳本列表
          await this.loadAreaScripts();
          
          // 設置當前選中的腳本
          this.selectedAreaScript = scriptData.name;
        }
        
        return success;
      } catch (error) {
        console.error('儲存局部 CITS 區域腳本錯誤:', error);
        throw error;
      } finally {
        this.isLoading = false;
      }
    },
    
    selectAreaScript(scriptName: string) {
      if (this.areaScripts[scriptName]) {
        this.selectedAreaScript = scriptName;
        
        // 更新局部區域
        if (this.areaScripts[scriptName].areas) {
          this.localAreas = [...this.areaScripts[scriptName].areas];
        }
        
        return true;
      }
      return false;
    },
    
    clearSelectedAreaScript() {
      this.selectedAreaScript = null;
    },
    
    // 預覽設定管理
    updatePreviewSettings(settings: Partial<PreviewSettings>) {
      this.previewSettings = { ...this.previewSettings, ...settings };
    },
    
    async generatePreview() {
      this.isLoading = true;
      
      try {
        const previewParams = {
          scan_center_x: this.previewSettings.center_x,
          scan_center_y: this.previewSettings.center_y,
          scan_range: this.previewSettings.scan_range,
          scan_angle: this.previewSettings.scan_angle,
          total_lines: this.previewSettings.total_lines,
          scan_direction: this.globalDirection,
          aspect_ratio: this.previewSettings.aspect_ratio,
          local_areas: this.localAreas.map(area => ({
            ...area,
            dy: area.dy * (area.startpoint_direction === -1 ? -1 : 1)
          }))
        };
        
        const preview = await window.pywebview.api.preview_local_cits(previewParams);
        
        this.previewData = {
          ...preview,
          center_x: this.previewSettings.center_x,
          center_y: this.previewSettings.center_y
        };
        
        return this.previewData;
      } catch (error) {
        console.error('生成預覽錯誤:', error);
        throw error;
      } finally {
        this.isLoading = false;
      }
    },
    
    // 背景圖片管理
    updateBackgroundImage(image: string | null) {
      this.backgroundImage = image;
    },
    
    updateImageSettings(settings: Partial<{ scale: number; opacity: number }>) {
      this.imageSettings = { ...this.imageSettings, ...settings };
    },
    
    // 測量操作
    async startSingleCITS() {
      try {
        return await window.pywebview.api.start_ssts_cits(
          this.pointsX,
          this.pointsY,
          this.scanDirection
        );
      } catch (error) {
        console.error('開始單一 CITS 測量錯誤:', error);
        throw error;
      }
    },
    
    async startMultiCITS(scriptName: string) {
      try {
        return await window.pywebview.api.start_msts_cits(
          this.pointsX,
          this.pointsY,
          scriptName,
          this.scanDirection
        );
      } catch (error) {
        console.error('開始多重 CITS 測量錯誤:', error);
        throw error;
      }
    },
    
    async startLocalSingleCITS() {
      try {
        // 準備局部區域資料
        const processedAreas = this.localAreas.map(area => ({
          ...area,
          dy: area.dy * (area.startpoint_direction === -1 ? -1 : 1)
        }));
        
        const scanSettings = {
          center_x: this.previewSettings.center_x,
          center_y: this.previewSettings.center_y,
          scan_angle: this.previewSettings.scan_angle
        };
        
        return await window.pywebview.api.start_local_ssts_cits(
          processedAreas,
          this.globalDirection,
          scanSettings
        );
      } catch (error) {
        console.error('開始局部單一 CITS 測量錯誤:', error);
        throw error;
      }
    },
    
    async startLocalMultiCITS(scriptName: string) {
      try {
        // 準備局部區域資料
        const processedAreas = this.localAreas.map(area => ({
          ...area,
          dy: area.dy * (area.startpoint_direction === -1 ? -1 : 1)
        }));
        
        const scanSettings = {
          center_x: this.previewSettings.center_x,
          center_y: this.previewSettings.center_y,
          scan_angle: this.previewSettings.scan_angle
        };
        
        return await window.pywebview.api.start_local_msts_cits(
          processedAreas,
          scriptName,
          this.globalDirection,
          scanSettings
        );
      } catch (error) {
        console.error('開始局部多重 CITS 測量錯誤:', error);
        throw error;
      }
    }
  }
});

// 建立預設局部區域
function createDefaultLocalArea(): LocalArea {
  return {
    start_x: 0,
    start_y: 0,
    dx: 1,
    dy: 1,
    nx: 5,
    ny: 3,
    startpoint_direction: 1
  };
}