<template>
    <div class="p-4 h-[calc(100vh-4rem)] overflow-y-auto">
      <!-- 測量控制區域 -->
      <div class="bg-white rounded-lg shadow-md p-4 mb-4">
        <h2 class="text-lg font-medium mb-4">測量控制</h2>
        
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <!-- SMU 控制按鈕 -->
          <button 
            @click="toggleSMUConnection"
            class="p-3 rounded-lg text-white flex items-center justify-center"
            :class="isSMUConnected ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'"
          >
            <svg-icon name="chip" class="w-5 h-5 mr-2" />
            <span>{{ isSMUConnected ? '斷開 SMU 連接' : '連接 SMU' }}</span>
          </button>
          
          <!-- STS 測量按鈕 -->
          <button 
            @click="startSTSMeasurement"
            class="p-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center justify-center"
            :disabled="!isSMUConnected || isRunning"
            :class="{ 'opacity-50 cursor-not-allowed': !isSMUConnected || isRunning }"
          >
            <svg-icon name="wave" class="w-5 h-5 mr-2" />
            <span>開始 STS 測量</span>
          </button>
          
          <!-- CITS 測量按鈕 -->
          <button 
            @click="startCITSMeasurement"
            class="p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center justify-center"
            :disabled="!isSMUConnected || isRunning"
            :class="{ 'opacity-50 cursor-not-allowed': !isSMUConnected || isRunning }"
          >
            <svg-icon name="chart" class="w-5 h-5 mr-2" />
            <span>開始 CITS 測量</span>
          </button>
          
          <!-- Auto-Move 測量按鈕 -->
          <button 
            @click="startAutoMoveMeasurement"
            class="p-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg flex items-center justify-center"
            :disabled="!isSMUConnected || isRunning"
            :class="{ 'opacity-50 cursor-not-allowed': !isSMUConnected || isRunning }"
          >
            <svg-icon name="arrows" class="w-5 h-5 mr-2" />
            <span>開始自動移動測量</span>
          </button>
        </div>
      </div>
      
      <!-- 預覽與結果區域 -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <!-- CITS 預覽 -->
        <CITSPreviewCard />
        
        <!-- Auto-Move 預覽 -->
        <AutoMovePreviewCard />
      </div>
      
      <!-- 測量狀態區域 -->
      <div class="bg-white rounded-lg shadow-md p-4 mt-4">
        <h2 class="text-lg font-medium mb-4">測量狀態</h2>
        
        <div class="flex flex-col md:flex-row md:items-center mb-4 space-y-2 md:space-y-0 md:space-x-4">
          <div class="flex-1">
            <div class="text-sm font-medium text-gray-500">目前狀態</div>
            <div 
              class="font-medium"
              :class="{
                'text-green-600': measurementStatus === '就緒',
                'text-blue-600': measurementStatus === '測量中',
                'text-red-600': measurementStatus === '錯誤'
              }"
            >
              {{ measurementStatus }}
            </div>
          </div>
          
          <div class="flex-1">
            <div class="text-sm font-medium text-gray-500">測量類型</div>
            <div class="font-medium">{{ currentMeasurementType || '無' }}</div>
          </div>
          
          <div class="flex-1">
            <div class="text-sm font-medium text-gray-500">測量開始時間</div>
            <div class="font-medium">{{ formatTime(startTime) }}</div>
          </div>
          
          <div class="flex-1">
            <div class="text-sm font-medium text-gray-500">測量時間</div>
            <div class="font-medium">{{ formatDuration(measurementDuration) }}</div>
          </div>
        </div>
        
        <!-- 進度條 -->
        <div v-if="isRunning" class="w-full bg-gray-200 rounded-full h-2.5 mb-4">
          <div 
            class="bg-blue-600 h-2.5 rounded-full"
            :style="{ width: `${measurementProgress}%` }"
          ></div>
        </div>
        
        <!-- 最近測量結果 -->
        <div v-if="hasRecentMeasurement">
          <h3 class="text-sm font-medium text-gray-500 mb-2">最近測量結果</h3>
          <div class="text-sm">
            <!-- 這裡可以放置最近測量結果的摘要信息 -->
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, computed } from 'vue';
  import SvgIcon from '@/components/common/SvgIcon.vue';
  import CITSPreviewCard from '@/components/dashboard/CITSPreviewCard.vue';
  import AutoMovePreviewCard from '@/components/dashboard/AutoMovePreviewCard.vue';
  import { useMeasurementStore } from '@/stores/measurement';
  import { useSMUStore } from '@/stores/smu';
  
  // 狀態管理
  const measurementStore = useMeasurementStore();
  const smuStore = useSMUStore();
  
  // SMU 連接狀態
  const isSMUConnected = computed(() => smuStore.isConnected);
  
  // 測量狀態
  const isRunning = computed(() => measurementStore.isRunning);
  const measurementStatus = computed(() => {
    if (isRunning.value) return '測量中';
    if (measurementStore.error) return '錯誤';
    return '就緒';
  });
  
  const currentMeasurementType = computed(() => measurementStore.currentType);
  const startTime = computed(() => measurementStore.startTime);
  const measurementDuration = computed(() => {
    if (!isRunning.value || !startTime.value) return 0;
    return Date.now() - startTime.value;
  });
  const measurementProgress = computed(() => measurementStore.progress);
  const hasRecentMeasurement = computed(() => measurementStore.lastMeasurement !== null);
  
  // 功能方法
  const formatTime = (timestamp: number | null) => {
    if (!timestamp) return '無';
    return new Date(timestamp).toLocaleString();
  };
  
  const formatDuration = (ms: number) => {
    if (!ms) return '0秒';
    
    const seconds = Math.floor(ms / 1000);
    if (seconds < 60) return `${seconds}秒`;
    
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}分鐘${remainingSeconds > 0 ? ` ${remainingSeconds}秒` : ''}`;
  };
  
  // SMU 連接控制
  const toggleSMUConnection = async () => {
    try {
      if (isSMUConnected.value) {
        await smuStore.disconnect();
      } else {
        await smuStore.connect();
      }
    } catch (error) {
      console.error('SMU 連接操作失敗:', error);
    }
  };
  
  // 開始測量
  const startSTSMeasurement = async () => {
    if (isRunning.value || !isSMUConnected.value) return;
    
    try {
      await measurementStore.startMeasurement('sts');
    } catch (error) {
      console.error('STS 測量啟動失敗:', error);
    }
  };
  
  const startCITSMeasurement = async () => {
    if (isRunning.value || !isSMUConnected.value) return;
    
    try {
      await measurementStore.startMeasurement('cits');
    } catch (error) {
      console.error('CITS 測量啟動失敗:', error);
    }
  };
  
  const startAutoMoveMeasurement = async () => {
    if (isRunning.value || !isSMUConnected.value) return;
    
    try {
      await measurementStore.startMeasurement('auto-move');
    } catch (error) {
      console.error('自動移動測量啟動失敗:', error);
    }
  };
  </script>