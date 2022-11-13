<template>
  <div class="el-dropdown-link" @click="click">书签</div>
  <vue3-menus class="aaa" v-model:open="open" :event="event" :menus="menus"></vue3-menus>
</template>
  
<script lang="ts" setup>
import { Vue3Menus } from '~/components/ContentMenu'
import { onMounted, ref, nextTick, computed } from 'vue'

const items = ref([])
const menus = ref([])

onMounted(async () => {
  const tree = await chrome.bookmarks.getTree()
  tree[0].children?.forEach(item => {
    if (item.title === "移动设备书签") {
      items.value = items.value.concat([item])
    } else {
      items.value = items.value.concat(item.children)
    }
  })

  const trans = (item) => {
    const tmp = {label: item.title}
    if (item.url) {
      tmp.click = () => {
        window.open(item.url)
      }
    }
    if ((item.children || []).length > 0) {
      tmp.children = []
      item.children.forEach(each => {
        tmp.children.push(trans(each))
      })
    }
    return tmp
  }

  menus.value = items.value.map(item => {
    return trans(item)
  })
})

const open = ref(false);
const event = ref({});
function click(e: any) {
  open.value = false;
  nextTick(() => {
    event.value = e;
    open.value = true;
  })
  e.preventDefault();
}

</script>
<style>
.my-menus-item {
    display: flex;
    line-height: 2rem;
    padding: 0 1rem;
    margin: 0;
    font-size: 0.8rem;
    outline: 0;
    align-items: center;
    transition: 0.2s;
    box-sizing: border-box;
    list-style: none;
    border-bottom: 1px solid #00000000;
}

.my-menus-item-divided {
    border-bottom-color: #ebeef5;
}

.my-menus-item-available {
    color: #606266;
    cursor: pointer;
}

.my-menus-item-available:hover {
    background: #ecf5ff;
    color: #409eff;
}

.my-menus-item-active {
    background: #ecf5ff;
    color: #409eff;
}

.my-menus-item-disabled {
    color: #c0c4cc;
    cursor: not-allowed;
}
</style>
  