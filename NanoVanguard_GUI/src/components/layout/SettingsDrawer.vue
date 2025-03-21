<template>
    <div
      class="h-full bg-white shadow-lg transition-all duration-300 overflow-hidden border-r border-gray-200 z-10"
      :class="drawerClasses"
    >
      <!-- 抽屜標題和關閉按鈕 -->
      <div class="h-16 px-4 flex items-center justify-between border-b border-gray-200">
        <h2 class="text-lg font-medium">{{ drawerTitle }}</h2>
        <button 
          @click="closeDrawer" 
          class="p-2 rounded-full hover:bg-gray-100 transition-colors"
        >
          <svg-icon name="x" class="w-5 h-5" />
        </button>
      </div>
  
      <!-- 動態內容區域 -->
      <div class="p-4 h-[calc(100%-4rem)] overflow-y-auto">
        <component 
          :is="currentPanel" 
          v-if="currentPanel" 
          @close="closeDrawer"
        />
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { computed } from 'vue';
  import { useUIStore } from '@/stores/ui';
  import SvgIcon from '@/components/common/SvgIcon.vue';
  
  // SMU 相關組件
  import SMUControlPanel from '@/components/smu/SMUControlPanel.vue';
  // STS 相關組件
  import STSScriptPanel from '@/components/sts/STSScriptPanel.vue';
  // CITS 相關組件
  import CITSSettingsPanel from '@/components/cits/CITSSettingsPanel.vue';
  // Auto-Move 相關組件
  import AutoMoveScriptPanel from '@/components/automove/AutoMoveScriptPanel.vue';
  
  // UI 狀態管理
  const uiStore = useUIStore();
  
  // 計算當前應該顯示的面板組件
  const currentPanel = computed(() => {
    switch (uiStore.activeTab) {
      case 'smu':
        return SMUControlPanel;
      case 'sts':
        return STSScriptPanel;
      case 'cits':
        return CITSSettingsPanel;
      case 'auto-move':
        return AutoMoveScriptPanel;
      default:
        return null;
    }
  });
  
  // 計算抽屜標題
  const drawerTitle = computed(() => {
    switch (uiStore.activeTab) {
      case 'smu':
        return 'SMU 控制面板';
      case 'sts':
        return 'STS 腳本設定';
      case 'cits':
        return 'CITS 參數設定';
      case 'auto-move':
        return '自動移動腳本';
      default:
        return '';
    }
  });
  
  // 計算抽屜寬度樣式
  const drawerClasses = computed(() => {
    return {
      'w-0': !uiStore.isDrawerOpen,
      'w-80 md:w-96': uiStore.isDrawerOpen
    };
  });
  
  // 關閉抽屜
  const closeDrawer = () => {
    uiStore.closeDrawer();
  };
  </script>