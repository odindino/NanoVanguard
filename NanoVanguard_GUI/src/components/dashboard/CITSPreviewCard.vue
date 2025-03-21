<template>
    <div class="bg-white rounded-lg shadow-md p-4 h-full flex flex-col">
      <div class="flex justify-between items-center mb-4">
        <h3 class="text-lg font-medium text-gray-900">CITS 預覽</h3>
        
        <div class="flex space-x-2">
          <button
            @click="handleGenPreview"
            class="px-3 py-1.5 text-sm bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 flex items-center"
            :disabled="isLoading"
            :class="{ 'opacity-50 cursor-not-allowed': isLoading }"
          >
            <svg-icon name="chart" class="w-4 h-4 mr-1.5" />
            <span>生成預覽</span>
          </button>
          
          <button
            @click="openCITSSettings"
            class="p-1.5 text-gray-500 hover:text-gray-700 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <svg-icon name="settings" class="w-4 h-4" />
          </button>
        </div>
      </div>
      
      <template v-if="previewData">
        <!-- 預覽資訊 -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4 text-sm bg-gray-50 p-3 rounded-md border border-gray-200">
          <div>
            <span class="text-gray-500">中心座標:</span>
            <div class="font-mono">
              ({{ formatNumber(previewData.center_x) }}, {{ formatNumber(previewData.center_y) }}) nm
            </div>
          </div>
          
          <div>
            <span class="text-gray-500">掃描範圍:</span>
            <div class="font-mono">{{ formatNumber(previewData.range) }} nm</div>
          </div>
          
          <div>
            <span class="text-gray-500">掃描角度:</span>
            <div class="font-mono">{{ formatNumber(previewData.angle) }}°</div>
          </div>
          
          <div>
            <span class="text-gray-500">總點數:</span>
            <div class="font-mono">{{ previewData.total_points }}</div>
          </div>
        </div>
        
        <!-- 預覽圖 -->
        <div class="flex-1 min-h-32 bg-white border border-gray-200 rounded-md overflow-hidden" ref="plotRef">
          <div id="citsPlotContainer" class="w-full h-full"></div>
        </div>
      </template>
      
      <template v-else>
        <div class="flex-1 flex flex-col items-center justify-center text-center p-6 bg-gray-50 rounded-md border border-gray-200">
          <svg-icon name="chart" class="w-10 h-10 text-gray-400 mb-2" />
          <p class="text-gray-500 mb-4">尚未生成 CITS 預覽</p>
          <p class="text-sm text-gray-400">開啟 CITS 設定面板編輯區域設定，然後點擊「生成預覽」按鈕</p>
        </div>
      </template>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
  import SvgIcon from '@/components/common/SvgIcon.vue';
  import { useCITSStore } from '@/stores/cits';
  import { useUIStore } from '@/stores/ui';
  
  // Store
  const citsStore = useCITSStore();
  const uiStore = useUIStore();
  
  // 引用
  const plotRef = ref<HTMLElement | null>(null);
  
  // 計算屬性
  const previewData = computed(() => citsStore.previewData);
  const isLoading = computed(() => citsStore.isLoading);
  
  // 格式化數字
  const formatNumber = (value: number | undefined) => {
    if (value === undefined) return '0.00';
    return value.toFixed(2);
  };
  
  // 開啟 CITS 設定面板
  const openCITSSettings = () => {
    uiStore.toggleDrawer('cits');
  };
  
  // 生成預覽
  const handleGenPreview = async () => {
    try {
      // 先取得 SXM 狀態更新預覽設定
      const sxmStatus = await window.pywebview.api.get_sxm_status();
      
      // 更新預覽設定
      if (sxmStatus) {
        citsStore.updatePreviewSettings({
          center_x: Number(sxmStatus.center_x || 0),
          center_y: Number(sxmStatus.center_y || 0),
          scan_range: Number(sxmStatus.scan_range || 100),
          scan_angle: Number(sxmStatus.scan_angle || 0),
          total_lines: Number(sxmStatus.total_lines || 500),
          aspect_ratio: Number(sxmStatus.aspect_ratio || 1)
        });
      }
      
      // 生成預覽
      await citsStore.generatePreview();
      
      // 下一個渲染週期後更新圖表
      setTimeout(() => {
        renderPlot();
      }, 0);
    } catch (error) {
      console.error('生成 CITS 預覽失敗:', error);
    }
  };
  
  // 渲染圖表
  const renderPlot = () => {
    if (!previewData.value || !window.Plotly) return;
    
    const container = document.getElementById('citsPlotContainer');
    if (!container) return;
    
    const { data, layout } = previewData.value;
    
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
      ...layout,
      margin: { l: 50, r: 30, t: 30, b: 50 },
      autosize: true,
      showlegend: true,
      hoverlabel: {
        bgcolor: '#FFF',
        font: { size: 12 }
      },
      legend: {
        x: 1,
        y: 1,
        xanchor: 'right',
        yanchor: 'top'
      }
    };
    
    // 渲染圖表
    window.Plotly.newPlot(container, data, customLayout, config);
  };
  
  // 處理視窗大小改變
  const handleResize = () => {
    if (previewData.value && window.Plotly) {
      const container = document.getElementById('citsPlotContainer');
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
  onMounted(() => {
    if (previewData.value) {
      renderPlot();
    }
    
    window.addEventListener('resize', handleResize);
  });
  
  // 卸載時的清理
  onUnmounted(() => {
    window.removeEventListener('resize', handleResize);
    
    // 清除圖表
    const container = document.getElementById('citsPlotContainer');
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