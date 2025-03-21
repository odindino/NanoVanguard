import { defineStore } from 'pinia';

export type SidebarTab = 'smu' | 'sts' | 'cits' | 'auto-move';

interface UIState {
  activeTab: SidebarTab | null;
  isDrawerOpen: boolean;
  drawerWidth: number;
}

export const useUIStore = defineStore('ui', {
  state: (): UIState => ({
    activeTab: null,
    isDrawerOpen: false,
    drawerWidth: 384, // 預設 384px (tailwind 的 w-96)
  }),

  actions: {
    toggleDrawer(tab: SidebarTab | null = null) {
      // 如果選擇的是相同 tab，則切換抽屜開關狀態
      if (tab === this.activeTab) {
        this.isDrawerOpen = !this.isDrawerOpen;
      } 
      // 如果選擇不同 tab 且抽屜已開啟，則切換到新的 tab
      else if (tab !== null) {
        this.activeTab = tab;
        this.isDrawerOpen = true;
      } 
      // 否則關閉抽屜
      else {
        this.isDrawerOpen = false;
        this.activeTab = null;
      }
    },

    closeDrawer() {
      this.isDrawerOpen = false;
    },
  },
});