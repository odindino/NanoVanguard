<template>
    <div class="h-full flex flex-col overflow-hidden">
      <!-- 標準 CITS 設定區域 -->
      <div class="p-4 border-b border-gray-200">
        <h3 class="text-lg font-medium text-gray-900 mb-4">標準 CITS 設定</h3>
        
        <div class="space-y-4">
          <!-- 點數設定 -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                點數 X (1-512)
              </label>
              <input
                type="number"
                v-model.number="pointsX"
                min="1"
                max="512"
                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                點數 Y (1-512)
              </label>
              <input
                type="number"
                v-model.number="pointsY"
                min="1"
                max="512"
                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>
          
          <!-- 掃描方向 -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              掃描方向
            </label>
            <div class="flex space-x-4">
              <label class="inline-flex items-center">
                <input
                  type="radio"
                  :value="1"
                  v-model="scanDirection"
                  class="form-radio h-4 w-4 text-primary-600"
                />
                <span class="ml-2 text-gray-700">向上掃描</span>
              </label>
              <label class="inline-flex items-center">
                <input
                  type="radio"
                  :value="-1"
                  v-model="scanDirection"
                  class="form-radio h-4 w-4 text-primary-600"
                />
                <span class="ml-2 text-gray-700">向下掃描</span>
              </label>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 局部 CITS 設定區域 -->
      <div class="flex-1 overflow-y-auto p-4">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-medium text-gray-900">局部 CITS 設定</h3>
          
          <div class="flex space-x-2">
            <!-- 區域腳本選擇 -->
            <select
              v-model="selectedAreaScript"
              class="px-3 py-1.5 text-sm border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
              @change="handleAreaScriptSelect"
            >
              <option value="">選擇區域腳本...</option>
              <option
                v-for="script in areaScriptsList"
                :key="script.name"
                :value="script.name"
              >
                {{ script.name }}
              </option>
            </select>
            
            <button
              @click="handleRefreshAreaScripts"
              class="p-1.5 bg-gray-100 text-gray-600 rounded-md hover:bg-gray-200"
              title="更新區域腳本"
            >
              <svg-icon name="refresh" class="w-4 h-4" />
            </button>
            
            <button
              @click="addLocalArea"
              class="p-1.5 bg-primary-100 text-primary-700 rounded-md hover:bg-primary-200"
              title="添加區域"
            >
              <svg-icon name="plus" class="w-4 h-4" />
            </button>
          </div>
        </div>
        
        <!-- 區域腳本名稱輸入 -->
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-1">
            區域腳本名稱
          </label>
          <div class="flex space-x-2">
            <input
              type="text"
              v-model="areaScriptName"
              class="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
              placeholder="請輸入區域腳本名稱"
            />
            
            <button
              @click="saveAreaScript"
              class="px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              :disabled="!areaScriptName || isLoading"
              :class="{ 'opacity-50 cursor-not-allowed': !areaScriptName || isLoading }"
            >
              儲存腳本
            </button>
          </div>
        </div>
        
        <!-- 全域掃描方向設定 -->
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-1">
            全域方向
          </label>
          <div class="flex space-x-4">
            <label class="inline-flex items-center">
              <input
                type="radio"
                :value="1"
                v-model="globalDirection"
                class="form-radio h-4 w-4 text-primary-600"
              />
              <span class="ml-2 text-gray-700">向上</span>
            </label>
            <label class="inline-flex items-center">
              <input
                type="radio"
                :value="-1"
                v-model="globalDirection"
                class="form-radio h-4 w-4 text-primary-600"
              />
              <span class="ml-2 text-gray-700">向下</span>
            </label>
          </div>
        </div>
        
        <!-- 局部區域列表 -->
        <div class="space-y-4">
          <div
            v-for="(area, index) in localAreas"
            :key="index"
            class="bg-gray-50 p-4 rounded-lg border border-gray-200"
          >
            <div class="flex justify-between items-center mb-4">
              <h4 class="text-base font-medium text-gray-900">
                區域 {{ index + 1 }}
              </h4>
              <button
                @click="removeLocalArea(index)"
                class="text-red-600 hover:text-red-800"
                :disabled="localAreas.length === 1"
                :class="{ 'opacity-50 cursor-not-allowed': localAreas.length === 1 }"
              >
                <svg-icon name="x" class="w-4 h-4" />
              </button>
            </div>
            
            <!-- 區域設定 -->
            <div class="grid grid-cols-2 gap-4 mb-4">
              <div class="space-y-1">
                <label class="block text-sm font-medium text-gray-700">
                  起始 X (nm)
                </label>
                <input
                  type="number"
                  v-model.number="area.start_x"
                  step="0.1"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div class="space-y-1">
                <label class="block text-sm font-medium text-gray-700">
                  起始 Y (nm)
                </label>
                <input
                  type="number"
                  v-model.number="area.start_y"
                  step="0.1"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>
            
            <div class="grid grid-cols-2 gap-4 mb-4">
              <div class="space-y-1">
                <label class="block text-sm font-medium text-gray-700">
                  步進 X (nm)
                </label>
                <input
                  type="number"
                  v-model.number="area.dx"
                  step="0.1"
                  min="0.1"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div class="space-y-1">
                <label class="block text-sm font-medium text-gray-700">
                  步進 Y (nm)
                </label>
                <input
                  type="number"
                  v-model.number="area.dy"
                  step="0.1"
                  min="0.1"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>
            
            <div class="grid grid-cols-2 gap-4 mb-4">
              <div class="space-y-1">
                <label class="block text-sm font-medium text-gray-700">
                  點數 X (1-512)
                </label>
                <input
                  type="number"
                  v-model.number="area.nx"
                  min="1"
                  max="512"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div class="space-y-1">
                <label class="block text-sm font-medium text-gray-700">
                  點數 Y (1-512)
                </label>
                <input
                  type="number"
                  v-model.number="area.ny"
                  min="1"
                  max="512"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>
            
            <div class="space-y-1">
              <label class="block text-sm font-medium text-gray-700">
                起始點方向
              </label>
              <select
                v-model.number="area.startpoint_direction"
                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
              >
                <option :value="1">向上</option>
                <option :value="-1">向下</option>
              </select>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 底部操作區 -->
      <div class="p-4 border-t border-gray-200">
        <button
          @click="handleGenPreview"
          class="w-full px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 flex items-center justify-center"
          :disabled="isLoading"
          :class="{ 'opacity-50 cursor-not-allowed': isLoading }"
        >
          <svg-icon name="chart" class="w-5 h-5 mr-2" />
          <span>生成預覽</span>
        </button>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, computed, onMounted, watch } from 'vue';
  import { useCITSStore, type LocalArea } from '@/stores/cits';
  import SvgIcon from '@/components/common/SvgIcon.vue';
  
  // Store
  const citsStore = useCITSStore();
  
  // 計算屬性
  const areaScriptsList = computed(() => citsStore.areaScriptsList);
  const isLoading = computed(() => citsStore.isLoading);
  
  // 標準 CITS 設定
  const pointsX = ref(citsStore.pointsX);
  const pointsY = ref(citsStore.pointsY);
  const scanDirection = ref<1 | -1>(citsStore.scanDirection);
  
  // 局部 CITS 設定
  const localAreas = ref<LocalArea[]>([...citsStore.localAreas]);
  const globalDirection = ref<1 | -1>(citsStore.globalDirection);
  
  // 腳本管理
  const selectedAreaScript = ref('');
  const areaScriptName = ref('');
  
  // 監聽標準 CITS 設定變更
  watch([pointsX, pointsY, scanDirection], ([newPointsX, newPointsY, newScanDirection]) => {
    citsStore.updateCITSSettings(
      Number(newPointsX),
      Number(newPointsY),
      newScanDirection as 1 | -1
    );
  });
  
  // 監聽局部區域變更
  watch(localAreas, (newAreas) => {
    citsStore.setLocalAreas([...newAreas]);
  }, { deep: true });
  
  // 監聽全域方向變更
  watch(globalDirection, (newDirection) => {
    citsStore.globalDirection = newDirection;
  });
  
  // 添加局部區域
  const addLocalArea = () => {
    citsStore.addLocalArea();
    localAreas.value = [...citsStore.localAreas];
  };
  
  // 移除局部區域
  const removeLocalArea = (index: number) => {
    citsStore.removeLocalArea(index);
    localAreas.value = [...citsStore.localAreas];
  };
  
  // 更新區域腳本
  const handleRefreshAreaScripts = async () => {
    try {
      await citsStore.loadAreaScripts();
      
      // 如果有選定的腳本，確保它在腳本列表中更新後仍然選中
      if (selectedAreaScript.value && citsStore.areaScripts[selectedAreaScript.value]) {
        handleAreaScriptSelect();
      }
    } catch (error) {
      console.error('載入區域腳本失敗:', error);
    }
  };
  
  // 腳本選擇處理
  const handleAreaScriptSelect = () => {
    if (!selectedAreaScript.value) {
      return;
    }
    
    const success = citsStore.selectAreaScript(selectedAreaScript.value);
    if (success) {
      areaScriptName.value = selectedAreaScript.value;
      localAreas.value = [...citsStore.localAreas];
    }
  };
  
  // 保存區域腳本
  const saveAreaScript = async () => {
    if (!areaScriptName.value.trim() || isLoading.value) return;
    
    try {
      const scriptData = {
        name: areaScriptName.value,
        areas: [...localAreas.value]
      };
      
      await citsStore.saveAreaScript(scriptData);
      selectedAreaScript.value = areaScriptName.value;
    } catch (error) {
      console.error('儲存區域腳本失敗:', error);
    }
  };
  
  // 生成預覽
  const handleGenPreview = async () => {
    try {
      // 先取得 SXM 狀態更新預覽設定
      const sxmStatus = await window.pywebview.api.get_sxm_status();
      
      // 更新預覽設定
      if (sxmStatus) {
        citsStore.updatePreviewSettings({
          center_x: Number(sxmStatus.center_x || 0),
          center_y: Number(sxmStatus.center_y || 0),
          scan_range: Number(sxmStatus.scan_range || 100),
          scan_angle: Number(sxmStatus.scan_angle || 0),
          total_lines: Number(sxmStatus.total_lines || 500),
          aspect_ratio: Number(sxmStatus.aspect_ratio || 1)
        });
      }
      
      // 生成預覽
      await citsStore.generatePreview();
    } catch (error) {
      console.error('生成 CITS 預覽失敗:', error);
    }
  };
  
  // 初始化
  onMounted(async () => {
    // 加載區域腳本
    if (Object.keys(citsStore.areaScripts).length === 0) {
      await handleRefreshAreaScripts();
    }
    
    // 初始化選定的腳本
    if (citsStore.selectedAreaScript) {
      selectedAreaScript.value = citsStore.selectedAreaScript;
      areaScriptName.value = citsStore.selectedAreaScript;
    }
    
    // 更新局部區域
    localAreas.value = [...citsStore.localAreas];
  });
  </script>