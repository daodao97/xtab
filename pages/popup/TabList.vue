<template>
  <!-- <el-scrollbar max-height="50px"> -->
  <el-row :gutter="20">
    <el-col :span="18">
      <span>xtab</span>
    </el-col>
    <el-col :span="2">
      <el-icon v-if="items.length > 0" @click="clearRecycle">
        <Delete></Delete>
      </el-icon>
    </el-col>
    <el-col :span="2">
      <el-icon @click="openOption">
        <Setting></Setting>
      </el-icon>
    </el-col>
  </el-row>

  <el-divider v-if="items.length > 0"></el-divider>
  <div v-for="item in items" :key="item.tabId" class="content">
    <el-row :gutter="10" class="content-text">
      <el-col :span="3" class="content-icon">
        <img style="display:inline-block; width: 16px;" type="image/x-icon" :src="item.ico" />
      </el-col>
      <el-col :span="21" @click="openTab(item)" class="content-title">
        {{ item.title }}
      </el-col>
    </el-row>
  </div>
  <!-- </el-scrollbar> -->
</template>
  
<script setup lang="ts">
import { RecycleTabs } from "~/service/base";
import { table } from "~/service/recycle_tabs";
import { onMounted, onUnmounted, ref } from "vue";
import { Setting, Delete } from '@element-plus/icons-vue'

const openOption = () => {
  chrome.runtime.openOptionsPage()
}

const load = async (): Promise<void> => {
  const list = await table.reverse().toArray()
  items.value = list
}

async function clearRecycle(): Promise<void> {
  await table.clear()
  await load()
}

const items = ref<RecycleTabs[]>([])

let timer: ReturnType<typeof setTimeout>
onMounted(async () => {
  await load()
  timer = setInterval(load, 500)
})
onUnmounted(() => {
  clearInterval(timer)
})

const openTab = async (data: RecycleTabs) => {
  window.open(data.url)
  await table.where({ tabId: data.tabId }).delete()
}
</script>

<style>
.el-divider--horizontal {
  margin: 5px 0;
}
.el-icon {
  cursor: pointer;
}
</style>
<style lang="scss" scoped>
.content {
  .content-text:hover {
    color: green;
    cursor: pointer;
  }

  .content-icon {
    height: 18px;
    line-height: 18px;
  }

  .content-title {
    height: 18px;
    line-height: 18px;
    display: inline-block;
    overflow: hidden;
  }
}
</style>
  