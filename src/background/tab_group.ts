import { ConfigOptions } from './default'
import { Tab } from 'chrome'

function arrDiff<T>(arr1: Array<T>, arr2: Array<T>): Array<T> {
    const inter = arrInter(arr1, arr2)
    return arr1.filter((x: T) => inter.indexOf(x) === -1)
}

function arrInter<T>(arr1: Array<T>, arr2: Array<T>): Array<T> {
    return arr1.filter((x: T) => arr2.indexOf(x) !== -1)
}

async function asyncForEach<T>(array: Array<T>, callback: (a: T, b: number) => Promise<void>) {
    for (let index = 0; index < array.length; index++) {
        await callback(array[index], index);
    }
}

export interface GMP {
    groupId: number
    tabId: number[]
}

export type windowGMP = Record<number, Record<string, GMP>>

export async function tabGroup(config: ConfigOptions, tab: Tab): Promise<string> {
    const url = new URL(tab.url!)
    let name = ''
    let parts = url.hostname.split(".").filter(e => e !== 'www') // www.a.com or a.b.com => [a] or [a, b]
    parts = parts.slice(0, parts.length-1)
    switch (config.tab_group_mode) {
        case 1: // 全域名
            name = parts.join('.')
            break;
        case 4: // 最末级域名
            name = parts[0]
            break;
        case 2: // 一级域名
            name = parts[parts.length - 2]
            break;
        case 3: // 自定义
            for (let i = 0; i < Object.values(config.tab_group_rules).length; i++) {
                const item = config.tab_group_rules[i]
                const parts = item.url.split(",").map(e => e.trim())
                let match = false
                parts.forEach(item => {
                    if (url.hostname.includes(item)) {
                        match = true
                    }
                })
                if (match) {
                    name = item.title
                    break
                }
            }

            break;
    }

    console.log(url.hostname, parts, config.tab_group_mode)

    return name || ''
}

const collapsedNotActiveGroup = async (windowId: number) => {
    const activeTab = await chrome.tabs.query({ active: true, windowId })
    const activeGroupId = activeTab.filter(e => e.groupId).map(e => e.groupId)
    const group = await chrome.tabGroups.query({windowId: windowId})
    const ids = group.map(({ id }) => id)

    asyncForEach(arrDiff(ids, activeGroupId), async id => {
        await chrome.tabGroups.update(id, { collapsed: true });
    })

}

export class WindowGroupMap {
    key: string = ''

    private async get(): Promise<windowGMP> {
        const data = await chrome.storage.sync.get(this.key)
        return data[this.key] || {}
    }

    private async set(data: windowGMP): Promise<void> {
        await chrome.storage.sync.set({ [this.key]: data })
    }

    async reGroup(config: ConfigOptions, windowId: number) {
        this.key = "WindowGroupMap" + config.tab_group_mode
        const data = await this.get()
        const wins = await chrome.windows.getAll()
        arrDiff(Object.keys(data).map(e => parseInt(e)), wins.map(e => e.id)).forEach((item: number | undefined) => {
            delete data[item!]
        })

        const gmp: Record<string, GMP> = {}
        let tabs = await chrome.tabs.query({ windowId: windowId })
        tabs = tabs.filter(e => !e.url?.startsWith("chrome"))

        const allTabIds = tabs.map(e => e.id!)

        await asyncForEach(tabs, async (tab, index) => {
            const name = await tabGroup(config, tab)
            if (gmp[name] === undefined) {
                gmp[name] = {
                    groupId: 0,
                    tabId: [tab.id!]
                }
            } else {
                gmp[name].tabId.push(tab.id!)
            }
        })

        const oldGmp = (data[windowId] || {})
        const newG = Object.keys(gmp)
        let oldG = Object.keys(oldGmp)
        oldG.forEach(item => {
            if (oldGmp[item].groupId === 0) {
                delete oldGmp[item]
            }
        })
        oldG = Object.keys(oldGmp)

        const theNewG = arrDiff(newG, oldG)

        await asyncForEach(theNewG, async (name, index) => {
            if (gmp[name].tabId.length > 1) {
                const groupId = await chrome.tabs.group({ tabIds: gmp[name].tabId })
                await chrome.tabGroups.update(groupId, { title: name || "", collapsed: false })
                gmp[name].groupId = groupId
            }
            if (gmp[name].tabId.length === 1) {
                await chrome.tabs.ungroup(gmp[name].tabId)
                gmp[name].groupId = 0
            }
        })


        const theOldG = arrInter(newG, oldG)

        await asyncForEach(theOldG, async (name, index) => {
            if (oldGmp[name].tabId.sort() === gmp[name].tabId.sort()) {
                return
            }

            gmp[name].groupId = oldGmp[name].groupId

            const delTabs = arrInter(arrDiff(oldGmp[name].tabId, gmp[name].tabId), allTabIds)
            if (delTabs.length > 0) {
                await chrome.tabs.ungroup(delTabs)
            }

            if (gmp[name].tabId.length === 1) {
                await chrome.tabs.ungroup(gmp[name].tabId)
                gmp[name].groupId = 0
                return
            }

            const newTabs = arrDiff(gmp[name].tabId, oldGmp[name].tabId)
            if (newTabs.length > 0) {
                await chrome.tabs.group({ tabIds: newTabs, groupId: oldGmp[name].groupId })
                gmp[name].groupId = oldGmp[name].groupId
            }
        })

        data[windowId] = gmp
        if (config.tab_group_auto_collapsed_inactivity) {
            collapsedNotActiveGroup(windowId)
        }
        await this.set(data)
    }
}