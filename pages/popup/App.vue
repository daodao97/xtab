<template>
   <el-config-provider :size="size" :z-index="zIndex">
    <main>
      <div>
        <el-button @click="onclick">Options</el-button>
      </div>
    </main>
  </el-config-provider>
</template>

<script setup lang="ts">
const size='small'
const zIndex = 3000
const onclick = () => {
  chrome.runtime.openOptionsPage()
}
</script>

<style>
</style>
