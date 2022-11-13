<template>
  <el-dropdown>
    <span class="el-dropdown-link">
      标签回收
      <el-icon class="el-icon--right">
        <!-- <arrow-down /> -->
      </el-icon>
    </span>
    <template #dropdown>
      <el-scrollbar max-height="400px">
        <el-dropdown-menu v-if="items?.length > 0">
          <el-dropdown-item v-for="item in items" :key="item.tabId" class="content">
            <el-row :gutter="10" class="content-text">
              <el-col :span="4">
                <img style="display:inline-block; width: 16px;" type="image/x-icon" :src="item.ico" />
              </el-col>
              <el-col :span="20">
                <a style="display:inline-block; width: 160px;overflow: hidden" @click="openTab(item)">{{ item.title
                }}</a>
              </el-col>
            </el-row>
            <div class="content-hover hide">
            </div>
          </el-dropdown-item>
        </el-dropdown-menu>
      </el-scrollbar>

    </template>
  </el-dropdown>
</template>
  
<script setup lang="ts">
import { liveQuery } from "dexie";
import { RecycleTabs } from "~/service/base";
import { table } from "~/service/recycle_tabs";
import { useObservable } from "@vueuse/rxjs";

const items = useObservable<Array<RecycleTabs>>(liveQuery(() => table.toArray()))

const openTab = async (data: RecycleTabs) => {
  window.open(data.url)
  await table.where({ tabId: data.tabId }).delete()
}
</script>
<style scoped>
ul {
  list-style-type: none;
  padding: 0;
}

li {
  margin: 0 10px;
}

p.error {
  color: red;
  font-weight: bold;
}


.content {
  display: block;
  position: absolute;
  right: 16px;
  bottom: 10px;
  cursor: pointer;
  overflow: visible;
}

.content-text:hover+.hide {
  display: block;
}

.content-hover {
  margin: auto;
  position: absolute;
  color: var(--el-text-color-regular);
  background: var(--el-bg-color);
  border-radius: var(--el-card-border-radius);
  border: 1px solid rgba(0, 0, 0, 0.15);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.175);
  right: 0px;
  white-space: nowrap;
  z-index: 9999999;
}

.content-hover:hover {
  display: block;
}


.hide {
  display: none;
}
</style>
  