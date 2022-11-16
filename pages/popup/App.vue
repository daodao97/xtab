<template>
  <el-config-provider :size="size" :z-index="zIndex">
    <main class="popup-main">
      <div>
        <el-button @click="onclick">配置xtab</el-button>
      </div>
      <el-tabs v-model="activeName" type="card" class="demo-tabs" @tab-click="handleClick">
        <el-tab-pane label="回收站" name="recycle">
          <TabList></TabList>
        </el-tab-pane>
      </el-tabs>
    </main>
  </el-config-provider>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { TabsPaneContext } from 'element-plus'
import TabList from './TabList.vue';

const size = 'small'
const zIndex = 3000
const onclick = () => {
  chrome.runtime.openOptionsPage()
}

const activeName = ref('recycle')

const handleClick = (tab: TabsPaneContext, event: Event) => {
  console.log(tab, event)
}
</script>

<style lang="scss" scoped>
.popup-main {
  padding: 20px;
  width: 500px;
  min-height: 300px;
}
</style>
