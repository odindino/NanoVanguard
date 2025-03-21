<template>
    <header class="bg-white shadow h-16 flex items-center justify-between px-4 z-10">
      <!-- 左側標題區域 -->
      <div class="flex items-center">
        <h1 class="text-xl font-semibold text-gray-800">
          <span>NanoVanguard</span>
          <span class="text-sm font-normal text-gray-500 ml-2">STM 控制系統</span>
        </h1>
      </div>
      
      <!-- 右側狀態和工具區域 -->
      <div class="flex items-center space-x-4">
        <!-- 連接狀態指示燈 -->
        <div class="flex items-center">
          <span class="mr-2 text-sm text-gray-600">狀態:</span>
          <span 
            class="inline-block w-3 h-3 rounded-full"
            :class="connectionStatusClass"
            :title="connectionStatusText"
          ></span>
        </div>
        
        <!-- 停止按鈕 -->
        <button 
          @click="stopMeasurement"
          class="px-3 py-1.5 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center"
          :disabled="!isRunning"
          :class="{ 'opacity-50 cursor-not-allowed': !isRunning }"
        >
          <svg-icon name="stop" class="w-4 h-4 mr-1.5" />
          <span>停止測量</span>
        </button>
      </div>
    </header>
  </template>
  
  <script setup lang="ts">
  import { ref, computed } from 'vue';
  import SvgIcon from '@/components/common/SvgIcon.vue';
  import { useMeasurementStore } from '@/stores/measurement';
  
  // 系統狀態
  const measurementStore = useMeasurementStore();
  const isRunning = computed(() => measurementStore.isRunning);
  const isConnected = computed(() => measurementStore.isConnected);
  
  // 連線狀態樣式
  const connectionStatusClass = computed(() => {
    if (isRunning.value) return 'bg-blue-500';
    return isConnected.value ? 'bg-green-500' : 'bg-red-500';
  });
  
  // 連線狀態說明
  const connectionStatusText = computed(() => {
    if (isRunning.value) return '測量進行中';
    return isConnected.value ? '已連接' : '未連接';
  });
  
  // 停止測量
  const stopMeasurement = async () => {
    if (!isRunning.value) return;
    
    try {
      await window.pywebview.api.stop_measurement();
      measurementStore.setRunningState(false);
    } catch (error) {
      console.error('停止測量失敗:', error);
    }
  };
  </script>