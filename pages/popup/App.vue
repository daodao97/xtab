<template>
  <el-config-provider :size="size" :z-index="zIndex">
    <main class="popup-main">
      <TabList></TabList>
    </main>
  </el-config-provider>
</template>

<script setup lang="ts">
import TabList from './TabList.vue';
const size = 'small'
const zIndex = 3000
</script>

<style lang="scss" scoped>
.popup-main {
  padding: 10px;
  width: 200px;
  max-height: 500px;
  overflow: scroll;
}

</style>
