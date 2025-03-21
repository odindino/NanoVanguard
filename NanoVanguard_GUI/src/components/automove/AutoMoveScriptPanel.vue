<template>
    <div class="h-full flex flex-col overflow-hidden">
      <!-- 腳本選擇與標題區域 -->
      <div class="p-4 border-b border-gray-200">
        <div class="space-y-4">
          <div class="flex space-x-4 items-end">
            <div class="flex-1">
              <label class="block text-sm font-medium text-gray-700 mb-2">
                選擇移動腳本
              </label>
              <select
                v-model="selectedScript"
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
  
      <!-- 移動腳本設定區域 -->
      <div class="flex-1 overflow-y-auto p-4">
        <h3 class="text-lg font-medium text-gray-900 mb-4">
          移動腳本設定
        </h3>
  
        <div class="space-y-6">
          <!-- 移動指令 -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              移動指令 (R: 右, U: 上, L: 左, D: 下)
            </label>
            <input
              type="text"
              v-model="movementScript"
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
              placeholder="例如: RULD"
            />
            <p class="mt-1 text-sm text-gray-500">
              字母組合代表移動順序，例如 RULD 表示依序向右、向上、向左、向下移動
            </p>
          </div>
          
          <!-- 距離設定 -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              移動距離 (nm)
            </label>
            <input
              type="number"
              v-model.number="moveDistance"
              step="0.1"
              min="0"
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          
          <!-- 等待時間設定 -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              等待時間 (秒)
            </label>
            <input
              type="number"
              v-model.number="waitTime"
              step="0.1"
              min="0"
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          
          <!-- 重複次數設定 -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              重複次數
            </label>
            <input
              type="number"
              v-model.number="repeatCount"
              min="1"
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          
          <!-- 移動說明 -->
          <div class="bg-gray-50 p-4 rounded-md border border-gray-200">
            <h4 class="text-sm font-medium text-gray-700 mb-2">移動說明</h4>
            <ul class="text-sm text-gray-600 space-y-1 pl-5 list-disc">
              <li>R: 向右移動指定距離</li>
              <li>U: 向上移動指定距離</li>
              <li>L: 向左移動指定距離</li>
              <li>D: 向下移動指定距離</li>
            </ul>
            <p class="mt-2 text-sm text-gray-600">
              移動完成後將等待指定的時間，然後進行測量。重複次數控制整個序列的重複執行次數。
            </p>
          </div>
        </div>
      </div>
  
      <!-- 底部操作區域 -->
      <div class="p-4 border-t border-gray-200 space-y-4">
        <button
          @click="saveScript"
          class="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 flex items-center justify-center"
          :disabled="isLoading || !scriptName || !movementScript"
          :class="{ 'opacity-50 cursor-not-allowed': isLoading || !scriptName || !movementScript }"
        >
          <svg-icon name="save" class="w-5 h-5 mr-2" />
          <span>保存腳本</span>
        </button>
        
        <button
          @click="handleGenPreview"
          class="w-full px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 flex items-center justify-center"
          :disabled="isLoading || !movementScript"
          :class="{ 'opacity-50 cursor-not-allowed': isLoading || !movementScript }"
        >
          <svg-icon name="arrows" class="w-5 h-5 mr-2" />
          <span>生成預覽</span>
        </button>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, computed, onMounted, watch } from 'vue';
  import { useAutoMoveStore } from '@/stores/automove';
  import SvgIcon from '@/components/common/SvgIcon.vue';
  
  // Store
  const autoMoveStore = useAutoMoveStore();
  
  // 本地狀態
  const selectedScript = ref('');
  const scriptName = ref('');
  const movementScript = ref('');
  const moveDistance = ref(200);
  const waitTime = ref(1.0);
  const repeatCount = ref(1);
  
  // 計算屬性
  const scriptsList = computed(() => autoMoveStore.scriptsList);
  const isLoading = computed(() => autoMoveStore.isLoading);
  
  // 加載腳本
  const handleRefreshScripts = async () => {
    try {
      await autoMoveStore.loadScripts();
      
      // 如果有選定的腳本，確保它在腳本列表中更新後仍然選中
      if (selectedScript.value && autoMoveStore.scripts[selectedScript.value]) {
        handleScriptSelect();
      }
    } catch (error) {
      console.error('載入自動移動腳本失敗:', error);
    }
  };
  
  // 腳本選擇處理
  const handleScriptSelect = () => {
    if (!selectedScript.value) {
      // 如果選擇空選項，清空編輯區域
      resetForm();
      return;
    }
    
    const script = autoMoveStore.scripts[selectedScript.value];
    if (script) {
      // 選擇腳本後，更新編輯區域
      scriptName.value = script.name;
      movementScript.value = script.script;
      moveDistance.value = script.distance;
      waitTime.value = script.waitTime;
      repeatCount.value = script.repeatCount;
      
      // 同時更新 store 中的選定腳本
      autoMoveStore.selectScript(script.name);
    }
  };
  
  // 重置表單
  const resetForm = () => {
    scriptName.value = '';
    movementScript.value = '';
    moveDistance.value = 200;
    waitTime.value = 1.0;
    repeatCount.value = 1;
    autoMoveStore.clearSelectedScript();
  };
  
  // 保存腳本
  const saveScript = async () => {
    if (!scriptName.value.trim() || !movementScript.value.trim() || isLoading.value) return;
    
    try {
      const scriptData = {
        name: scriptName.value,
        script: movementScript.value,
        distance: moveDistance.value,
        waitTime: waitTime.value,
        repeatCount: repeatCount.value
      };
      
      await autoMoveStore.saveScript(scriptData);
      selectedScript.value = scriptName.value;
      
      // 更新當前腳本資料，確保 store 中的資料與表單同步
      autoMoveStore.updateCurrentScript(scriptData);
    } catch (error) {
      console.error('儲存自動移動腳本失敗:', error);
    }
  };
  
  // 生成預覽
  const handleGenPreview = async () => {
    if (!movementScript.value.trim() || isLoading.value) return;
    
    try {
      // 更新當前腳本資料，確保與表單同步
      autoMoveStore.updateCurrentScript({
        script: movementScript.value,
        distance: moveDistance.value,
        waitTime: waitTime.value,
        repeatCount: repeatCount.value
      });
      
      // 先取得 SXM 狀態作為預覽參數
      const sxmStatus = await window.pywebview.api.get_sxm_status();
      
      // 生成預覽
      await autoMoveStore.generatePreview({
        center_x: Number(sxmStatus?.center_x || 0),
        center_y: Number(sxmStatus?.center_y || 0),
        angle: Number(sxmStatus?.angle || 0)
      });
    } catch (error) {
      console.error('生成自動移動預覽失敗:', error);
    }
  };
  
  // 監聽表單變化，同步到 store
  watch([movementScript, moveDistance, waitTime, repeatCount], 
    ([newScript, newDistance, newWaitTime, newRepeatCount]) => {
      autoMoveStore.updateCurrentScript({
        script: newScript,
        distance: newDistance,
        waitTime: newWaitTime,
        repeatCount: newRepeatCount
      });
    }
  );
  
  // 監聽 store 中選定腳本的變化
  watch(() => autoMoveStore.selectedScript, (newValue) => {
    if (newValue !== selectedScript.value) {
      selectedScript.value = newValue || '';
      if (newValue) {
        handleScriptSelect();
      }
    }
  });
  
  // 掛載時初始化
  onMounted(async () => {
    // 加載腳本列表
    if (Object.keys(autoMoveStore.scripts).length === 0) {
      await handleRefreshScripts();
    }
    
    // 如果 store 中已有當前腳本資料
    const currentScript = autoMoveStore.currentScriptData;
    if (currentScript && currentScript.script) {
      // 更新本地狀態
      scriptName.value = currentScript.name || '';
      movementScript.value = currentScript.script;
      moveDistance.value = currentScript.distance;
      waitTime.value = currentScript.waitTime;
      repeatCount.value = currentScript.repeatCount;
    }
    
    // 如果有選定的腳本，更新選擇器
    if (autoMoveStore.selectedScript) {
      selectedScript.value = autoMoveStore.selectedScript;
    }
  });
  </script>