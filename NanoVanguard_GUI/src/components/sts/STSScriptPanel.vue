<template>
    <div class="h-full flex flex-col overflow-hidden">
      <!-- 腳本選擇與標題區域 -->
      <div class="p-4 border-b border-gray-200">
        <div class="space-y-4">
          <div class="flex space-x-4 items-end">
            <div class="flex-1">
              <label class="block text-sm font-medium text-gray-700 mb-2">
                選擇腳本
              </label>
              <select
                v-model="selectedScriptName"
                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                @change="handleScriptSelect"
              >
                <option value="">選擇腳本...</option>
                <option
                  v-for="script in scriptsList"
                  :key="script.name"
                  :value="script.name"
                >
                  {{ script.name }}
                </option>
              </select>
            </div>
  
            <button
              @click="handleRefreshScripts"
              class="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              更新腳本
            </button>
          </div>
  
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              腳本名稱
            </label>
            <input
              type="text"
              v-model="scriptName"
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
              placeholder="請輸入腳本名稱"
            />
          </div>
        </div>
      </div>
  
      <!-- 電壓設定區域 -->
      <div class="flex-1 overflow-y-auto p-4">
        <h3 class="text-lg font-medium text-gray-900 mb-4">
          電壓設定
        </h3>
  
        <div class="space-y-6">
          <!-- 電壓設定表格 -->
          <div class="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <!-- 表頭 -->
            <div class="bg-gray-50 px-4 py-3 border-b border-gray-200 grid grid-cols-12 gap-4">
              <div class="col-span-5 font-medium text-gray-700">Vds (V)</div>
              <div class="col-span-5 font-medium text-gray-700">Vg (V)</div>
              <div class="col-span-2"></div>
            </div>
  
            <!-- 表格內容 -->
            <div class="divide-y divide-gray-200">
              <div
                v-for="(_, index) in vdsList"
                :key="index"
                class="grid grid-cols-12 gap-4 px-4 py-3 items-center"
              >
                <div class="col-span-5">
                  <input
                    type="number"
                    v-model.number="vdsList[index]"
                    step="0.1"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                <div class="col-span-5">
                  <input
                    type="number"
                    v-model.number="vgList[index]"
                    step="0.1"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                <div class="col-span-2 flex justify-end">
                  <button
                    @click="removeRow(index)"
                    class="w-8 h-8 flex items-center justify-center text-red-600 hover:text-red-800 focus:outline-none"
                    title="移除行"
                  >
                    <svg-icon name="x" class="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
  
          <!-- 添加行按鈕 -->
          <button
            @click="addRow"
            class="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 w-full flex items-center justify-center"
          >
            <svg-icon name="plus" class="w-5 h-5 mr-2" />
            <span>添加電壓設定</span>
          </button>
        </div>
      </div>
  
      <!-- 底部操作區域 -->
      <div class="p-4 border-t border-gray-200">
        <button
          @click="saveScript"
          class="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 flex items-center justify-center"
          :disabled="isLoading || !scriptName"
          :class="{ 'opacity-50 cursor-not-allowed': isLoading || !scriptName }"
        >
          <svg-icon name="save" class="w-5 h-5 mr-2" />
          <span>保存腳本</span>
        </button>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, computed, onMounted, watch } from 'vue';
  import { useSTSStore } from '@/stores/sts';
  import SvgIcon from '@/components/common/SvgIcon.vue';
  
  // Store
  const stsStore = useSTSStore();
  
  // 本地狀態
  const selectedScriptName = ref('');
  const scriptName = ref('');
  const vdsList = ref<number[]>([0]);
  const vgList = ref<number[]>([0]);
  
  // 計算屬性
  const scriptsList = computed(() => stsStore.scriptsList);
  const isLoading = computed(() => stsStore.isLoading);
  
  // 加載腳本
  const handleRefreshScripts = async () => {
    try {
      await stsStore.loadScripts();
      
      // 如果有選定的腳本，確保它在腳本列表中更新後仍然選中
      if (selectedScriptName.value && stsStore.scripts[selectedScriptName.value]) {
        handleScriptSelect();
      }
    } catch (error) {
      console.error('載入 STS 腳本失敗:', error);
    }
  };
  
  // 腳本選擇處理
  const handleScriptSelect = () => {
    if (!selectedScriptName.value) {
      // 如果選擇空選項，清空編輯區域
      scriptName.value = '';
      vdsList.value = [0];
      vgList.value = [0];
      return;
    }
    
    const script = stsStore.scripts[selectedScriptName.value];
    if (script) {
      // 選擇腳本後，更新編輯區域
      scriptName.value = script.name;
      vdsList.value = [...script.vds_list];
      vgList.value = [...script.vg_list];
      
      // 同時更新 store 中的選定腳本
      stsStore.selectScript(script.name);
    }
  };
  
  // 添加行
  const addRow = () => {
    vdsList.value.push(0);
    vgList.value.push(0);
  };
  
  // 移除行
  const removeRow = (index: number) => {
    if (vdsList.value.length > 1) {
      vdsList.value.splice(index, 1);
      vgList.value.splice(index, 1);
    }
  };
  
  // 保存腳本
  const saveScript = async () => {
    if (!scriptName.value.trim() || isLoading.value) return;
    
    try {
      await stsStore.saveScript(scriptName.value, vdsList.value, vgList.value);
      selectedScriptName.value = scriptName.value;
    } catch (error) {
      console.error('儲存 STS 腳本失敗:', error);
    }
  };
  
  // 監聽選定腳本變更
  watch(() => stsStore.selectedScript, (newValue) => {
    if (newValue) {
      selectedScriptName.value = newValue;
      handleScriptSelect();
    }
  });
  
  // 掛載時初始化
  onMounted(async () => {
    // 加載腳本列表
    if (Object.keys(stsStore.scripts).length === 0) {
      await handleRefreshScripts();
    }
    
    // 如果已有選定腳本，則加載它
    if (stsStore.selectedScript) {
      selectedScriptName.value = stsStore.selectedScript;
      handleScriptSelect();
    }
  });
  
  // 擴展 SvgIcon 添加 plus 和 save 圖標
  // 需要在 SvgIcon.vue 中添加這些圖標定義
  </script>