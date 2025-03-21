<template>
    <div class="bg-gray-50 p-4 rounded-md border border-gray-200 space-y-2">
      <h5 class="text-sm font-medium text-gray-700">測量結果</h5>
      
      <div class="grid grid-cols-2 gap-x-4 gap-y-2">
        <div>
          <span class="text-xs text-gray-500">電壓:</span>
          <div class="font-mono text-base">
            {{ formatReading(state.lastReading?.voltage) }} V
          </div>
        </div>
        
        <div>
          <span class="text-xs text-gray-500">電流:</span>
          <div class="font-mono text-base">
            {{ formatCurrentReading(state.lastReading?.current) }} 
          </div>
        </div>
        
        <div class="col-span-2">
          <span class="text-xs text-gray-500">最後讀取時間:</span>
          <div class="text-xs text-gray-600">
            {{ formatTimestamp(state.lastReading?.timestamp) }}
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { type ChannelState } from '@/stores/smu';
  
  // 定義 props
  const props = defineProps<{
    state: ChannelState;
  }>();
  
  // 格式化數值方法
  const formatReading = (value: number | undefined): string => {
    if (value === undefined) return '0.000000';
    return value.toFixed(6);
  };
  
  // 根據電流大小自動選擇合適的單位 (A, mA, μA, nA)
  const formatCurrentReading = (value: number | undefined): string => {
    if (value === undefined) return '0.000000 A';
    
    const absValue = Math.abs(value);
    
    if (absValue >= 1e-3) {
      // 毫安 (mA) 以上顯示為 A
      return `${value.toFixed(6)} A`;
    } else if (absValue >= 1e-6) {
      // 微安 (μA) 範圍
      return `${(value * 1e3).toFixed(6)} mA`;
    } else if (absValue >= 1e-9) {
      // 納安 (nA) 範圍
      return `${(value * 1e6).toFixed(6)} μA`;
    } else {
      // 皮安 (pA) 範圍或更小
      return `${(value * 1e9).toFixed(6)} nA`;
    }
  };
  
  // 格式化時間戳
  const formatTimestamp = (timestamp: number | undefined): string => {
    if (!timestamp) return '尚未讀取';
    return new Date(timestamp).toLocaleString();
  };
  </script>