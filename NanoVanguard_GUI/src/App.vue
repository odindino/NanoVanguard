<template>
  <div class="flex h-screen bg-gray-100 overflow-hidden">
    <!-- 固定側邊欄 -->
    <AppSidebar />

    <!-- 可展開的側邊抽屜面板 -->
    <SettingsDrawer />

    <!-- 主內容區域 -->
    <main class="flex-1 overflow-auto">
      <!-- 頂部工具列 -->
      <AppHeader />
      
      <!-- 主面板內容 -->
      <DashboardPanel />
    </main>
  </div>
</template>

<script setup lang="ts">
import AppSidebar from '@/components/layout/AppSidebar.vue';
import SettingsDrawer from '@/components/layout/SettingsDrawer.vue';
import AppHeader from '@/components/layout/AppHeader.vue';
import DashboardPanel from '@/components/dashboard/DashboardPanel.vue';
</script>