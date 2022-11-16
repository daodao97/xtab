<template>
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
</style>
  