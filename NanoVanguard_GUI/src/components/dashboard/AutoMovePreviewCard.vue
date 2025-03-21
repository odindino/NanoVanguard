<template>
    <div class="bg-white rounded-lg shadow-md p-4 h-full flex flex-col">
      <div class="flex justify-between items-center mb-4">
        <h3 class="text-lg font-medium text-gray-900">自動移動預覽</h3>
        
        <div class="flex space-x-2">
          <button
            @click="handleGenPreview"
            class="px-3 py-1.5 text-sm bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 flex items-center"
            :disabled="isLoading || !hasScript"
            :class="{ 'opacity-50 cursor-not-allowed': isLoading || !hasScript }"
          >
            <svg-icon name="arrows" class="w-4 h-4 mr-1.5" />
            <span>生成預覽</span>
          </button>
          
          <button
            @click="openAutoMoveSettings"
            class="p-1.5 text-gray-500 hover:text-gray-700 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <svg-icon name="settings" class="w-4 h-4" />
          </button>
        </div>
      </div>
      
      <template v-if="previewData && hasScript">
        <!-- 腳本資訊 -->
        <div class="mb-4 bg-gray-50 p-3 rounded-md border border-gray-200">
          <div class="text-sm">
            <span class="text-gray-500">移動腳本:</span>
            <code class="ml-2 bg-gray-100 px-1.5 py-0.5 rounded text-gray-900 font-mono">
              {{ currentScript.script }}
            </code>
          </div>
          <div class="text-sm mt-1 flex space-x-4">
            <div>
              <span class="text-gray-500">移動距離:</span>
              <span class="ml-1 font-mono">{{ currentScript.distance }} nm</span>
            </div>
            <div>
              <span class="text-gray-500">重複次數:</span>
              <span class="ml-1 font-mono">{{ currentScript.repeatCount }}</span>
            </div>
          </div>
        </div>
        
        <!-- 預覽圖 -->
        <div class="flex-1 min-h-32 bg-white border border-gray-200 rounded-md overflow-hidden" ref="plotRef">
          <div id="autoMovePlotContainer" class="w-full h-full"></div>
        </div>
      </template>
      
      <template v-else-if="!hasScript">
        <div class="flex-1 flex flex-col items-center justify-center text-center p-6 bg-gray-50 rounded-md border border-gray-200">
          <svg-icon name="arrows" class="w-10 h-10 text-gray-400 mb-2" />
          <p class="text-gray-500 mb-4">尚未設定移動腳本</p>
          <p class="text-sm text-gray-400">開啟自動移動設定面板選擇或創建移動腳本</p>
          <button
            @click="openAutoMoveSettings"
            class="mt-4 px-3 py-1.5 bg-primary-600 text-white text-sm rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            設定移動腳本
          </button>
        </div>
      </template>
      
      <template v-else>
        <div class="flex-1 flex flex-col items-center justify-center text-center p-6 bg-gray-50 rounded-md border border-gray-200">
          <svg-icon name="arrows" class="w-10 h-10 text-gray-400 mb-2" />
          <p class="text-gray-500 mb-4">尚未生成自動移動預覽</p>
          <p class="text-sm text-gray-400">點擊「生成預覽」按鈕查看移動軌跡</p>
        </div>
      </template>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
  import SvgIcon from '@/components/common/SvgIcon.vue';
  import { useAutoMoveStore } from '@/stores/automove';
  import { useUIStore } from '@/stores/ui';
  
  // Store
  const autoMoveStore = useAutoMoveStore();
  const uiStore = useUIStore();
  
  // 引用
  const plotRef = ref<HTMLElement | null>(null);
  
  // 計算屬性
  const previewData = computed(() => autoMoveStore.previewData);
  const isLoading = computed(() => autoMoveStore.isLoading);
  const currentScript = computed(() => autoMoveStore.currentScriptData);
  const hasScript = computed(() => Boolean(currentScript.value.script.trim()));
  
  // 開啟自動移動設定面板
  const openAutoMoveSettings = () => {
    uiStore.toggleDrawer('auto-move');
  };
  
  // 生成預覽
  const handleGenPreview = async () => {
    if (!hasScript.value || isLoading.value) return;
    
    try {
      // 先取得 SXM 狀態作為預覽參數
      const sxmStatus = await window.pywebview.api.get_sxm_status();
      
      // 生成預覽
      await autoMoveStore.generatePreview({
        center_x: Number(sxmStatus?.center_x || 0),
        center_y: Number(sxmStatus?.center_y || 0),
        angle: Number(sxmStatus?.angle || 0)
      });
      
      // 下一個渲染週期後更新圖表
      setTimeout(() => {
        renderPlot();
      }, 0);
    } catch (error) {
      console.error('生成自動移動預覽失敗:', error);
    }
  };
  
  // 渲染圖表
  const renderPlot = () => {
    if (!previewData.value || !window.Plotly) return;
    
    const container = document.getElementById('autoMovePlotContainer');
    if (!container) return;
    
    // 清空容器
    container.innerHTML = '';
    
    // 設置圖表配置
    const config = {
      responsive: true,
      displayModeBar: true,
      displaylogo: false,
      modeBarButtonsToRemove: ['lasso2d', 'select2d']
    };
    
    // 自定義佈局
    const customLayout = {
      ...(previewData.value.layout || {}),
      margin: { l: 50, r: 30, t: 30, b: 50 },
      autosize: true,
      showlegend: true,
      hovermode: 'closest',
      xaxis: {
        title: 'X 位置 (nm)',
        autorange: true
      },
      yaxis: {
        title: 'Y 位置 (nm)',
        autorange: true,
        scaleanchor: 'x',
        scaleratio: 1
      }
    };
    
    // 渲染圖表
    window.Plotly.newPlot(container, previewData.value.data, customLayout, config);
  };
  
  // 處理視窗大小改變
  const handleResize = () => {
    if (previewData.value && window.Plotly) {
      const container = document.getElementById('autoMovePlotContainer');
      if (container) {
        window.Plotly.Plots.resize(container);
      }
    }
  };
  
  // 監聽預覽數據變化
  watch(() => previewData.value, (newData) => {
    if (newData && window.Plotly) {
      renderPlot();
    }
  }, { deep: true });
  
  // 掛載時的初始化
  onMounted(async () => {
    // 載入腳本
    if (Object.keys(autoMoveStore.scripts).length === 0) {
      await autoMoveStore.loadScripts();
    }
    
    if (previewData.value) {
      renderPlot();
    }
    
    window.addEventListener('resize', handleResize);
  });
  
  // 卸載時的清理
  onUnmounted(() => {
    window.removeEventListener('resize', handleResize);
    
    // 清除圖表
    const container = document.getElementById('autoMovePlotContainer');
    if (container && window.Plotly) {
      window.Plotly.purge(container);
    }
  });
  
  // 為 Plotly 定義全局類型
  declare global {
    interface Window {
      Plotly: any;
    }
  }
  </script>