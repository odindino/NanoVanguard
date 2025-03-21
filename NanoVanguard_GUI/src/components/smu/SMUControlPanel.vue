<template>
    <div class="h-full flex flex-col overflow-y-auto">
      <!-- 連接設置區域 -->
      <div class="p-4 border-b border-gray-200">
        <h3 class="text-lg font-medium mb-4">連接設定</h3>
        
        <div class="flex items-center space-x-4">
          <div class="flex-1">
            <label class="block text-sm font-medium text-gray-700 mb-1">
              VISA 位址
            </label>
            <input
              type="text"
              v-model="visaAddress"
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
              :disabled="isConnected"
              placeholder="例如：TCPIP0::172.30.32.98::inst0::INSTR"
            />
          </div>
          
          <button
            @click="handleConnection"
            class="px-4 py-2 rounded-md text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2"
            :class="isConnected ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500' : 'bg-green-600 hover:bg-green-700 focus:ring-green-500'"
          >
            {{ isConnected ? '斷開連接' : '連接' }}
          </button>
        </div>
      </div>
      
      <!-- 通道控制區域 -->
      <div class="p-4 space-y-6 flex-1 overflow-y-auto">
        <h3 class="text-lg font-medium mb-4">通道控制</h3>
        
        <div class="space-y-6">
          <!-- 通道 1 (Source-Drain) -->
          <ChannelControl
            :channel="1"
            :state="channelStates[1]"
            :is-connected="isConnected"
            label="通道 1 (Source-Drain)"
            @set-value="handleSetValue"
            @toggle-output="handleToggleOutput"
            @read-values="handleReadValues"
            @set-compliance="handleSetCompliance"
          />
          
          <!-- 通道 2 (Gate) -->
          <ChannelControl
            :channel="2"
            :state="channelStates[2]"
            :is-connected="isConnected"
            label="通道 2 (Gate)"
            @set-value="handleSetValue"
            @toggle-output="handleToggleOutput"
            @read-values="handleReadValues"
            @set-compliance="handleSetCompliance"
          />
        </div>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { computed } from 'vue';
  import { useSMUStore, type ChannelState } from '@/stores/smu';
  import ChannelControl from '@/components/smu/ChannelControl.vue';

  
  // 使用 SMU Store
  const smuStore = useSMUStore();
  
  // 計算屬性
  const isConnected = computed(() => smuStore.isConnected);
  const visaAddress = computed({
    get: () => smuStore.visaAddress,
    set: (value: string) => smuStore.visaAddress = value
  });
  const channelStates = computed(() => smuStore.channels);
  
  // 連接處理
  const handleConnection = async () => {
    try {
      if (isConnected.value) {
        await smuStore.disconnect();
      } else {
        await smuStore.connect();
      }
    } catch (error) {
      console.error('連接操作失敗:', error);
    }
  };
  
  // 設置通道值
  const handleSetValue = async (channel: number, mode: 'VOLTAGE' | 'CURRENT', value: number) => {
    try {
      await smuStore.setChannelValue(channel, mode, value);
    } catch (error) {
      console.error(`設置通道 ${channel} 值失敗:`, error);
    }
  };
  
  // 切換通道輸出
  const handleToggleOutput = async (channel: number) => {
    try {
      await smuStore.toggleChannelOutput(channel);
    } catch (error) {
      console.error(`切換通道 ${channel} 輸出失敗:`, error);
    }
  };
  
  // 讀取通道值
  const handleReadValues = async (channel: number) => {
    try {
      await smuStore.readChannelValues(channel);
    } catch (error) {
      console.error(`讀取通道 ${channel} 值失敗:`, error);
    }
  };
  
  // 設置合規值
  const handleSetCompliance = async (channel: number, value: number) => {
    try {
      await smuStore.setCompliance(channel, value);
    } catch (error) {
      console.error(`設置通道 ${channel} 合規值失敗:`, error);
    }
  };
  </script>