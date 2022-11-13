import { Tab } from '@types/chrome'
import { createOrUpdate, remove, table as tabs, earliest, removeGrouped, removeNotExistWindow, removeBy as removeByTab } from '~/service/tabs'
import { create, table as recycle, removeNotExistWindow as recycleRemoveNotExistWindow, removeBy as removeByRecycle } from '~/service/recycle_tabs'
import { ConfigOptions } from './default'

export async function clearOnWindowCreate() {
    try {
        const wins = await chrome.windows.getAll()
        const ids = wins.map(({ id }) => id)
        if (ids.length > 0) {
            await removeNotExistWindow(ids as number[])
            await recycleRemoveNotExistWindow(ids as number[])
        }
    } catch (e) {
        console.log(e)
    }
}

export async function clearOnWindowRemove(windowId: number) {
    await removeByTab({ windowId: windowId })
    const wins = await chrome.windows.getAll()
    const ids: number[] = []
    wins.forEach(item => {
      ids.push(item.id!)
    })
    if (ids.length > 0) {
      await recycleRemoveNotExistWindow(ids)
    }
}

export async function clearOnTabRemove(tabId: number) {
    try {
        await remove(tabId)
      } catch (e) {
        console.log(e)
      }
}

export async function tabRecycleInit() {
    const tabs = await chrome.tabs.query({ groupId: -1 })
    tabs.forEach(async tab => {
        await createOrUpdate({
            tabId: tab.id as number,
            windowId: tab.windowId,
            lastActiveTime: new Date().getTime(),
            pinned: tab.pinned ? 1 : 0,
            groupId: tab.groupId
        })
    })
}

export async function tabRecycle(config: ConfigOptions, tab: Tab) {
    await createOrUpdate({
        tabId: tab.id as number,
        windowId: tab.windowId,
        lastActiveTime: new Date().getTime(),
        pinned: tab.pinned ? 1 : 0,
        groupId: tab.groupId
    })

    let tabs = await chrome.tabs.query({ windowId: tab.windowId, groupId: -1 })
    if (tabs.length >= config.auto_recycle_max_tab_num) {
        await removeGrouped()
        const earliestTabId = await earliest(tab.windowId)
        if (earliestTabId > 0) {
            const trash = await chrome.tabs.get(earliestTabId)
            if (!trash.url?.startsWith("chrome")) {
                await create({ tabId: trash.id!, windowId: trash.windowId, ico: trash.favIconUrl!, url: trash.url!, title: trash.title!, groupId: trash.groupId })
            }
            remove(earliestTabId)
            await chrome.tabs.remove(earliestTabId)
        }
    }
}