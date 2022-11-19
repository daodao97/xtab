<template>
  <el-config-provider :size="size" :z-index="zIndex">
    <main class="options-main">
      <v-form :key="key" v-model="config" v-bind="formOpts" @submit="onsubmit"></v-form>
    </main>
  </el-config-provider>
</template>

<script setup lang="ts">
import { ref, onBeforeMount } from 'vue'
import { VForm } from '@okiss/vbtf'
import { getConfig, saveConfig } from '~/background/default'
import { ElMessage } from 'element-plus'
const size = 'small'
const zIndex = 3000

const config = ref({})
const key = ref(0)

onBeforeMount(() => {
  getConfig().then(data => {
    config.value = data
    key.value++
  })
})

const formOpts = {
  formItems: [
    {
      section: '标签回收',
      field: "auto_recycle_tab",
      label: "标签自动回收",
      type: 'switch',
      value: true,
      info: "开启后, 标签数据超过配置阈值时, 会关闭老的标签, 防止标签过多"
    },
    {
      field: "auto_recycle_max_tab_num",
      label: "最大标签数",
      type: 'number',
      depend: {
        field: 'auto_recycle_tab',
        value: true
      },
      info: "如果当前窗口标签数超过该阈值, 则会回收最早的标签"
    },
    {
      section: '相同地址只保留一个',
      field: "just_one_tab",
      label: "只留一个",
      type: 'switch',
      value: true,
      info: "开启后, 相同url的标签将只保留一个"
    },
    {
      field: "just_one_tab_exclude",
      label: "排除",
      depend: {
        field: 'just_one_tab',
        value: true
      },
      info: "请填写域名关键字, 多个用逗号分割, 配置后该域名将会排除只要一个的控制"
    },
    {
      section: '自动跳转',
      field: "auto_jump",
      label: "自动跳转",
      type: 'switch',
      value: true,
      info: "点击很多平台内部的链接时, 往往会有二次确认的步骤, 如 知乎,简书,微信等, 开启后会自动跳转"
    },
    {
      section: '标签分组',
      field: "tab_group",
      label: "标签分组",
      type: 'switch',
      value: true,
      info: "开启后, 标签将按照以下规则分组"
    },
    {
      field: "tab_group_mode",
      label: "分组策略",
      type: 'select',
      value: 1,
      options: [
        {
          value: 1,
          label: "按域名自动分组"
        },
        {
          value: 2,
          label: "按一级域名自动分组"
        },
        {
          value: 3,
          label: "自定义分组规则"
        }
      ],
      depend: {
        field: 'tab_group',
        value: true
      }
    },
    {
      field: "tab_group_auto_collapsed_inactivity",
      label: "自动折叠",
      type: 'switch',
      info: "开启后, 自动折叠不活跃分组",
      depend: {
        field: 'tab_group',
        value: true
      }
    },
    {
      field: "tab_group_rules",
      label: "分组规则",
      type: 'sub-form',
      depend: [{
        field: 'tab_group',
        value: true
      }, {
        field: 'tab_group_mode',
        value: 3
      }],
      props: {
        repeat: true,
        max: 50,
        formItems: [
          {
            field: 'title',
            label: '标题',
            info: "尽量短些",
            rules: 'required|max:20',
            col: {
              span: 4
            }
          },
          {
            field: 'color',
            label: '颜色',
            type: 'select',
            value: '',
            col: {
              span: 4
            },
            options: [
              {
                value: '',
                label: '随机',
              },
              {
                value: 'gray',
                label: '灰色',
              }
            ]
          },
          {
            field: 'url',
            label: '匹配路由',
            info: "多个可以逗号分割",
            rules: 'required',
            col: {
              span: 16
            }
          },
        ]
      }
    },
  ],
  options: {
    cancelButton: false,
    // submitButton: false
  }
}

const onsubmit = (data: any) => {
  saveConfig(data).then(_ => {
    ElMessage.success("保存成功")
  })
}
</script>

<style lang="scss" scoped>
.options-main {
  margin: 20px;
  height: 100%;
}
</style>
