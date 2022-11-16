import { ConfigOptions } from './default'
import { Tab } from 'chrome'

export interface Group {
    id: number
    tabId: number[]
}

export type GMP = Record<number, Record<string, Group>>

export class GroupMap {
    key: string
    constructor(key: string) {
        this.key = key
    }

    async get(): Promise<GMP> {
        const data = await chrome.storage.sync.get(this.key)
        return data[this.key] || {}
    }

    async set(data: GMP): Promise<void> {
        await chrome.storage.sync.set({ [this.key]: data })
    }

    async add(windowId: number, groupName: string, tabId: number): Promise<void> {
        await this.gid(windowId, groupName, tabId)
        const data = await this.get()
        if (data[windowId] === undefined) {
            data[windowId] = {}
        }
        if (data[windowId][groupName] === undefined) {
            data[windowId][groupName] = { id: 0, tabId: [] }
        }

        if (!data[windowId][groupName].tabId.includes(tabId)) {
            data[windowId][groupName].tabId.push(tabId)
        }

        console.log(groupName, data[windowId][groupName].tabId.length )

        if (data[windowId][groupName].tabId.length == 2 && data[windowId][groupName].id == 0) {
            const groupId = await chrome.tabs.group({ tabIds: data[windowId][groupName].tabId })
            await chrome.tabGroups.update(groupId, { title: groupName || "Groups", collapsed: false })
            data[windowId][groupName].id = groupId
        }
        if (data[windowId][groupName].tabId.length > 2) {
            await chrome.tabs.group({ groupId: data[windowId][groupName].id, tabIds: tabId })
        }

        await this.set(data)

        await this.clearGroup(windowId)
    }

    async gid(windowId: number, groupName: string, tabId: number): Promise<number> {
        const data = await this.get()
        if (data[windowId] === undefined) {
            data[windowId] = {}
        }

        const wins = await chrome.windows.getAll()
        const ids: number[] = []
        wins.forEach(item => {
            ids.push(item.id!)
        })

        const winIds = Object.keys(data)
        const tabs = await chrome.tabs.query({ windowId: windowId })
        const tabIds = tabs.map(e => e.id)
        for (let i = 0; i < winIds.length; i++) {
            const winId = parseInt(winIds[i])
            if (!ids.includes(winId)) {
                delete data[winId]
                continue
            }

            const groups = Object.keys(data[winId])
            for (let j = 0; j < groups.length; j++) {
                const name = groups[j]
                data[winId][name].tabId = data[winId][name].tabId.filter(id => tabIds.includes(id))
                if (data[winId][name].tabId.length === 0) {
                    delete data[winId][name]
                    continue
                }
                if (data[winId][name].id === 0 && data[winId][name].tabId.length == 1) {
                    continue
                }
                const glist = await chrome.tabs.query({ groupId: data[winId][name].id })
                if (glist.length === 0) {
                    delete data[winId][name]
                    continue
                }

                const realTabIds = glist.map(e => e.id!)
                for (let k = 0; k < realTabIds.length; k++) {
                    if (realTabIds[k] === tabId && name !== groupName) {
                        delete realTabIds[k]
                        await chrome.tabs.ungroup(tabId)
                    }
                }

                if (realTabIds.length === 0) {
                    delete data[winId][name]
                    continue 
                }

                data[winId][name].tabId = realTabIds
            }
        }

        await this.set(data)

        return data[windowId][groupName] === undefined ? 0 : data[windowId][groupName].id
    }

    async clear(windowId: number): Promise<void> {
        const data = await this.get()
        delete data[windowId]
        await this.set(data)
    }

    async clearGroup(windowId: number): Promise<void> {
        const data = await this.get()
        const wins = await chrome.windows.getAll()
        const ids: number[] = []
        wins.forEach(item => {
            ids.push(item.id!)
        })

        const winIds = Object.keys(data)
        const tabs = await chrome.tabs.query({ windowId: windowId })
        const tabIds = tabs.map(e => e.id)
        for (let i = 0; i < winIds.length; i++) {
            const winId = parseInt(winIds[i])
            if (!ids.includes(winId)) {
                delete data[winId]
                continue
            }

            const groups = Object.keys(data[winId])
            for (let j = 0; j < groups.length; j++) {
                const name = groups[j]
                data[winId][name].tabId = data[winId][name].tabId.filter(id => tabIds.includes(id))
                if (data[winId][name].tabId.length === 0) {
                    delete data[winId][name]
                    continue
                }
                if (data[winId][name].id === 0 && data[winId][name].tabId.length == 1) {
                    continue
                }
                const glist = await chrome.tabs.query({ groupId: data[winId][name].id })
                if (glist.length === 0) {
                    delete data[winId][name]
                    continue
                }

                const realTabIds = glist.map(e => e.id!)

                if (realTabIds.length === 0) {
                    delete data[winId][name]
                    continue 
                }

                if (realTabIds.length === 1 && data[winId][name].id !== 0) {
                    await chrome.tabs.ungroup(realTabIds) 
                    data[winId][name].id = 0
                    continue 
                }

                data[winId][name].tabId = realTabIds
            }
        }

        await this.set(data)

    }
}

const collapsedNotActiveGroup = async (activeGroupId: Number) => {
    const group = await chrome.tabGroups.query({})
    const ids = group.map(({ id }) => id)
    for (let i = 0; i < ids.length; i++) {
        const id = ids[i]
        if (id !== activeGroupId) {
            await chrome.tabGroups.update(id, { collapsed: true });
        }
    }
}

const collapsedAllGroup = async () => {
    const group = await chrome.tabGroups.query({})
    const ids = group.map(({ id }) => id)
    for (let i = 0; i < ids.length; i++) {
        const id = ids[i]
        await chrome.tabGroups.update(id, { collapsed: true });
    }
}


async function tabToGroup(name: string, tabId: number, windowId: number, group: GroupMap) {
    await group.add(windowId, name, tabId)
}

const gMap = new GroupMap('gmp_1')
const gMap2 = new GroupMap('gmp_2')
const gMap3 = new GroupMap('gmp_3')

export async function tabUnGroup(config: ConfigOptions, tabId: number, windowId: number) {
    switch (config.tab_group_mode) {
        case 1:
            gMap.clearGroup(windowId)
            break;
        case 2:
            gMap2.clearGroup(windowId)
            break;
        case 3:
            gMap3.clearGroup(windowId)
            break;
    }
}

export async function tabGroup(config: ConfigOptions, tab: Tab) {
    const url = new URL(tab.url!)
    let name = ''
    switch (config.tab_group_mode) {
        case 1:
            const startIndex = url.hostname.startsWith("www") ? url.hostname.indexOf(".") + 1 : 0
            const lastIndex = url.hostname.lastIndexOf(".")
            name = url.hostname.substring(startIndex, lastIndex)
            await tabToGroup(name, tab.id!, tab.windowId, gMap)
            break;
        case 2:
            const parts = url.hostname.split(".")
            name = parts[parts.length - 2]
            await tabToGroup(name, tab.id!, tab.windowId, gMap2)
            break;
        case 3:
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

            if (name !== "") {
                await tabToGroup(name, tab.id!, tab.windowId, gMap3)
            }

            break;
    }

    // const _tab = await chrome.tabs.get(tabId)
    // if (_tab.groupId > 0) {
    //   await collapsedNotActiveGroup(_tab.groupId)
    // } else {
    //   await collapsedAllGroup()
    // }
}

export async function clearCache(windowId: number) {
    await gMap.clear(windowId)
    await gMap2.clear(windowId)
    await gMap3.clear(windowId)
}