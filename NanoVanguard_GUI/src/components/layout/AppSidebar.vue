<template>
    <aside class="w-16 md:w-20 bg-slate-800 text-white flex flex-col shadow-lg z-20">
      <!-- Logo 區域 -->
      <div class="flex items-center justify-center py-4 border-b border-slate-700">
        <img src="@/assets/logo.svg" alt="NanoVanguard" class="w-10 h-10" />
      </div>
      
      <!-- 導航項目 -->
      <nav class="flex flex-col items-center py-4 space-y-6 flex-1">
        <!-- SMU 控制面板 -->
        <button
          class="sidebar-button group"
          :class="{ active: activeTab === 'smu' }"
          @click="toggleDrawer('smu')"
          title="SMU 控制面板"
        >
          <svg-icon name="chip" class="w-6 h-6" />
          <span class="sidebar-tooltip">SMU</span>
        </button>
        
        <!-- STS 量測 -->
        <button
          class="sidebar-button group"
          :class="{ active: activeTab === 'sts' }"
          @click="toggleDrawer('sts')"
          title="STS 量測"
        >
          <svg-icon name="wave" class="w-6 h-6" />
          <span class="sidebar-tooltip">STS</span>
        </button>
        
        <!-- CITS 量測 -->
        <button
          class="sidebar-button group"
          :class="{ active: activeTab === 'cits' }"
          @click="toggleDrawer('cits')"
          title="CITS 量測"
        >
          <svg-icon name="chart" class="w-6 h-6" />
          <span class="sidebar-tooltip">CITS</span>
        </button>
        
        <!-- 自動移動量測 -->
        <button
          class="sidebar-button group"
          :class="{ active: activeTab === 'auto-move' }"
          @click="toggleDrawer('auto-move')"
          title="自動移動量測"
        >
          <svg-icon name="arrows" class="w-6 h-6" />
          <span class="sidebar-tooltip">Auto-Move</span>
        </button>
      </nav>
      
      <!-- 底部設定區域 -->
      <div class="px-2 py-4 border-t border-slate-700">
        <button class="sidebar-button group" title="設定">
          <svg-icon name="settings" class="w-6 h-6" />
          <span class="sidebar-tooltip">設定</span>
        </button>
      </div>
    </aside>
  </template>
  
  <script setup lang="ts">
  import { computed } from 'vue';
  import { useUIStore, type SidebarTab } from '@/stores/ui';
  import SvgIcon from '@/components/common/SvgIcon.vue';
  
  const uiStore = useUIStore();
  const activeTab = computed(() => uiStore.activeTab);
  
  const toggleDrawer = (tab: SidebarTab) => {
    uiStore.toggleDrawer(tab);
  };
  </script>
  
  <style>
  @reference "../style.css";

  .sidebar-button {
    @apply relative p-3 rounded-lg text-slate-300 hover:text-white hover:bg-slate-700 transition-colors;
  }
  
  .sidebar-button.active {
    @apply bg-slate-700 text-white;
  }
  
  .sidebar-tooltip {
    @apply absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded 
           invisible opacity-0 transition-opacity group-hover:visible group-hover:opacity-100;
  }
  </style>