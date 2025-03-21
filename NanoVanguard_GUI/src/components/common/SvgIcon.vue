<template>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    class="svg-icon"
    :class="[className]"
    :width="width"
    :height="height"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
  >
    <template v-if="name === 'chip'">
      <rect x="4" y="4" width="16" height="16" rx="2" ry="2"></rect>
      <rect x="9" y="9" width="6" height="6"></rect>
      <line x1="9" y1="2" x2="9" y2="4"></line>
      <line x1="15" y1="2" x2="15" y2="4"></line>
      <line x1="9" y1="20" x2="9" y2="22"></line>
      <line x1="15" y1="20" x2="15" y2="22"></line>
      <line x1="20" y1="9" x2="22" y2="9"></line>
      <line x1="20" y1="14" x2="22" y2="14"></line>
      <line x1="2" y1="9" x2="4" y2="9"></line>
      <line x1="2" y1="14" x2="4" y2="14"></line>
    </template>
    
    <template v-else-if="name === 'wave'">
      <path d="M2 12h2a2 2 0 0 1 2 2v4a2 2 0 0 0 2 2h2"></path>
      <path d="M10 6h2a2 2 0 0 1 2 2v8a2 2 0 0 0 2 2h2"></path>
      <path d="M18 3h2a2 2 0 0 1 2 2v13"></path>
    </template>
    
    <template v-else-if="name === 'chart'">
      <path d="M21 21H3V10"></path>
      <path d="M3 16l5-5 4 4 5-5 4 4"></path>
      <path d="M3 10l5-5 4 4 5-5 4 4"></path>
    </template>
    
    <template v-else-if="name === 'arrows'">
      <path d="M7 7h10v10"></path>
      <path d="M7 17 17 7"></path>
      <path d="M17 17V7H7"></path>
    </template>
    
    <template v-else-if="name === 'settings'">
      <circle cx="12" cy="12" r="3"></circle>
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
    </template>
    
    <template v-else-if="name === 'x'">
      <line x1="18" y1="6" x2="6" y2="18"></line>
      <line x1="6" y1="6" x2="18" y2="18"></line>
    </template>
    
    <template v-else-if="name === 'stop'">
      <rect x="6" y="6" width="12" height="12" rx="1"></rect>
    </template>
    
    <template v-else-if="name === 'check'">
      <polyline points="20 6 9 17 4 12"></polyline>
    </template>
    
    <template v-else-if="name === 'alert'">
      <circle cx="12" cy="12" r="10"></circle>
      <line x1="12" y1="8" x2="12" y2="12"></line>
      <line x1="12" y1="16" x2="12.01" y2="16"></line>
    </template>
    
    <template v-else-if="name === 'plus'">
      <line x1="12" y1="5" x2="12" y2="19"></line>
      <line x1="5" y1="12" x2="19" y2="12"></line>
    </template>
    
    <template v-else-if="name === 'save'">
      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
      <polyline points="17 21 17 13 7 13 7 21"></polyline>
      <polyline points="7 3 7 8 15 8"></polyline>
    </template>
    
    <template v-else-if="name === 'refresh'">
      <polyline points="23 4 23 10 17 10"></polyline>
      <polyline points="1 20 1 14 7 14"></polyline>
      <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
    </template>
    
    <template v-else>
      <!-- 預設圖示或空白 -->
      <circle cx="12" cy="12" r="10"></circle>
      <text x="12" y="14" text-anchor="middle" font-size="8" fill="currentColor">?</text>
    </template>
  </svg>
</template>

<script setup lang="ts">
// 定義圖標名稱類型
type IconName = 'chip' | 'wave' | 'chart' | 'arrows' | 'settings' | 'x' | 'stop' | 'check' | 'alert' | 'plus' | 'save' | 'refresh';

// 元件屬性
const props = defineProps({
  name: {
    type: String as () => IconName,
    required: true
  },
  width: {
    type: [Number, String],
    default: 24
  },
  height: {
    type: [Number, String],
    default: 24
  },
  className: {
    type: String,
    default: ''
  }
});
</script>

<style scoped>
.svg-icon {
  display: inline-block;
  vertical-align: middle;
}
</style>