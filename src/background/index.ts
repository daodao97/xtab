// import { sendMessage, onMessage } from 'webext-bridge'
import { getConfig, ConfigOptions, DefaultConfig } from './default'
import { tabGroup, clearCache, tabUnGroup } from './tab_group'
import { tabRecycleInit, tabRecycle, clearOnWindowCreate, clearOnWindowRemove, clearOnTabRemove } from './tab_recycle'
import { justOneTab } from './just_one_tab'

let config: ConfigOptions = DefaultConfig;

chrome.runtime.onInstalled.addListener(async () => {
  chrome.runtime.openOptionsPage()
  config = await getConfig()
  if (config.auto_recycle_tab) {
    await tabRecycleInit()
  }
})

chrome.tabs.onCreated.addListener(async (info) => {
})

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  config = await getConfig()

  if (config.just_one_tab && changeInfo.status === "loading") {
    await justOneTab(tab, config)
    return
  }

  if (changeInfo.status !== "complete") {
    return
  }

  if (config.tab_group && !tab.url?.startsWith("chrome")) {
    await tabGroup(config, tab)
  }

  if (config.auto_recycle_tab) {
    const _tab = await chrome.tabs.get(tabId)
    await tabRecycle(config, _tab)
  }
})

chrome.tabs.onRemoved.addListener(async (tabId, removeInfo) => {
  await clearOnTabRemove(tabId)
  removeInfo.windowId
  if (config.tab_group) {
    await tabUnGroup(config, tabId, removeInfo.windowId)
  }
})

chrome.tabs.onActivated.addListener(async (info) => {
})

chrome.windows.onRemoved.addListener(async (windowId) => {
  await clearOnWindowRemove(windowId)
  await clearCache(windowId)
})

chrome.windows.onCreated.addListener(async (window) => {
  await clearOnWindowCreate()
})

