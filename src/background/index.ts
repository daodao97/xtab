// import { sendMessage, onMessage } from 'webext-bridge'
import { getConfig, ConfigOptions, DefaultConfig } from './default'
import { tabGroup, clearCache } from './tab_group'
import { tabRecycleInit, tabRecycle, clearOnWindowCreate, clearOnWindowRemove, clearOnTabRemove } from './tab_recycle'

let config: ConfigOptions = DefaultConfig;

chrome.runtime.onInstalled.addListener(async () => {
  // chrome.tabs.create({
  //   url: "chrome://newtab/"
  // })
  chrome.runtime.openOptionsPage()
  config = await getConfig()
  if (config.auto_recycle_tab) {
    await tabRecycleInit()
  }
})


chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.status !== "complete") {
    return
  }

  config = await getConfig()

  if (config.tab_group && !tab.url?.startsWith("chrome")) {
    await tabGroup(config, tab)
  }

  if (config.auto_recycle_tab) {
    const _tab = await chrome.tabs.get(tabId)
    await tabRecycle(config, _tab)
  }
})

chrome.tabs.onActivated.addListener(async (info) => {
})

chrome.tabs.onRemoved.addListener(async (tabId, removeInfo) => {
  await clearOnTabRemove(tabId)
})

chrome.windows.onRemoved.addListener(async (windowId) => {
  await clearOnWindowRemove(windowId)
  await clearCache(windowId)
})

chrome.windows.onCreated.addListener(async (window) => {
  await clearOnWindowCreate()
})

