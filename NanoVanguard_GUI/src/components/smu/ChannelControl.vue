<template>
    <div class="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
      <h4 class="text-base font-medium text-gray-900 mb-4">{{ label }}</h4>
      
      <div class="space-y-4">
        <!-- 模式選擇 -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">模式</label>
          <select
            v-model="currentMode"
            class="w-40 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
            :disabled="!isConnected"
          >
            <option value="VOLTAGE">電壓</option>
            <option value="CURRENT">電流</option>
          </select>
        </div>
        
        <!-- 輸出值設定 -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            輸出值
          </label>
          <div class="flex items-center space-x-2">
            <input
              v-model.number="currentValue"
              type="number"
              step="0.1"
              class="w-40 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
              :disabled="!isConnected"
            />
            <span class="text-gray-600">{{ currentMode === 'VOLTAGE' ? 'V' : 'A' }}</span>
            <button
              @click="setValue"
              class="px-3 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              :disabled="!isConnected"
              :class="{ 'opacity-50 cursor-not-allowed': !isConnected }"
            >
              設定
            </button>
          </div>
        </div>
        
        <!-- 合規值設定 -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            合規值
          </label>
          <div class="flex items-center space-x-2">
            <input
              v-model.number="currentCompliance"
              type="number"
              step="0.001"
              class="w-40 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
              :disabled="!isConnected"
            />
            <span class="text-gray-600">A</span>
            <button
              @click="setCompliance"
              class="px-3 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              :disabled="!isConnected"
              :class="{ 'opacity-50 cursor-not-allowed': !isConnected }"
            >
              設定
            </button>
          </div>
        </div>
        
        <!-- 控制按鈕 -->
        <div class="flex space-x-4">
          <button
            @click="toggleOutput"
            class="flex-1 px-3 py-2 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-offset-2"
            :class="outputButtonClass"
            :disabled="!isConnected"
          >
            {{ state.outputOn ? '關閉輸出' : '開啟輸出' }}
          </button>
          
          <button
            @click="readValues"
            class="flex-1 px-3 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            :disabled="!isConnected"
            :class="{ 'opacity-50 cursor-not-allowed': !isConnected }"
          >
            讀取數值
          </button>
        </div>
        
        <!-- 讀數顯示 -->
        <ReadingDisplay :state="state" />
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, computed, watch, onMounted } from 'vue';
  import { type ChannelState } from '@/stores/smu';
  import ReadingDisplay from '@/components/smu/ReadingDisplay.vue';
  
  // 定義 props
  const props = defineProps<{
    channel: number;
    state: ChannelState;
    isConnected: boolean;
    label: string;
  }>();
  
  // 定義 emits
  const emit = defineEmits<{
    'set-value': [channel: number, mode: 'VOLTAGE' | 'CURRENT', value: number];
    'toggle-output': [channel: number];
    'read-values': [channel: number];
    'set-compliance': [channel: number, value: number];
  }>();
  
  // 本地狀態
  const currentMode = ref<'VOLTAGE' | 'CURRENT'>(props.state.mode);
  const currentValue = ref<number>(props.state.value);
  const currentCompliance = ref<number>(props.state.compliance);
  
  // 設定輸出按鈕樣式
  const outputButtonClass = computed(() => {
    if (!props.isConnected) return 'bg-gray-400 opacity-50 cursor-not-allowed';
    return props.state.outputOn 
      ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500' 
      : 'bg-green-600 hover:bg-green-700 focus:ring-green-500';
  });
  
  // 監聽狀態變化
  watch(() => props.state, (newState) => {
    currentMode.value = newState.mode;
    currentValue.value = newState.value;
    currentCompliance.value = newState.compliance;
  }, { deep: true });
  
  // 方法
  const setValue = () => {
    if (!props.isConnected) return;
    emit('set-value', props.channel, currentMode.value, currentValue.value);
  };
  
  const toggleOutput = () => {
    if (!props.isConnected) return;
    emit('toggle-output', props.channel);
  };
  
  const readValues = () => {
    if (!props.isConnected) return;
    emit('read-values', props.channel);
  };
  
  const setCompliance = () => {
    if (!props.isConnected) return;
    emit('set-compliance', props.channel, currentCompliance.value);
  };
  
  // 掛載時確保本地狀態與 prop 同步
  onMounted(() => {
    currentMode.value = props.state.mode;
    currentValue.value = props.state.value;
    currentCompliance.value = props.state.compliance;
  });
  </script>