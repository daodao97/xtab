import { db, Tabs } from './base'

export const table = db.tabs

export function createOrUpdate(tab: Tabs): Promise<Boolean> {
    return new Promise((resolve, reject) => {
        db.transaction('rw', db.tabs, async () => {
            const count = await db.tabs.where({ tabId: tab.tabId }).count()
            if (count > 0) {
                await db.tabs.update(tab.tabId, tab)
                resolve(true)
                return
            } else {
                await db.tabs.add(tab)
                resolve(true)
                return
            }
        }).catch(e => {
            reject(e.stack || e)
        });
    })
}


export function removeBy(where: Record<string, any>): Promise<Boolean> {
    return new Promise((resolve, reject) => {
        db.transaction('rw', db.tabs, async () => {
            await db.tabs.where({...where}).delete()
            resolve(true)
        }).catch(e => {
            reject(e.stack || e)
        });
    })
}

export function remove(key: Number): Promise<Boolean> {
    return new Promise((resolve, reject) => {
        db.transaction('rw', db.tabs, async () => {
            await db.tabs.where({ tabId: key }).delete()
            resolve(true)
        }).catch(e => {
            reject(e.stack || e)
        });
    })
}

export function removeGrouped(): Promise<Boolean> {
    return new Promise((resolve, reject) => {
        db.transaction('rw', db.tabs, async () => {
            await db.tabs.filter(item => {
                return item.groupId > 0
            }).delete()
            resolve(true)
        }).catch(e => {
            reject(e.stack || e)
        });
    })
}

export function removeNotExistWindow(windowId: number[]): Promise<Boolean> {
    return new Promise((resolve, reject) => {
        db.transaction('rw', db.tabs, async () => {
            await db.tabs.filter((item) => {
                return !windowId.includes(item.windowId)
            }).delete()
            resolve(true)
        }).catch(e => {
            reject(e.stack || e)
        });
    })
}

export function earliest(windowId: number): Promise<number> {
    return new Promise((resolve, reject) => {
        db.transaction('rw', db.tabs, async () => {
            let res = await db.tabs.where({ windowId: windowId, pinned: 0 }).sortBy("lastActiveTime")
            if (res.length === 0) {
                resolve(0)
                return 
            }
            resolve(res[0].tabId)
        }).catch(e => {
            reject(e.stack || e)
        });
    })
}

export function select(equalityCriterias: {
    [key: string]: any;
}): Promise<Array<Tabs>> {
    return new Promise((resolve, reject) => {
        db.transaction('rw', db.tabs, async () => {
            const list = await db.tabs.where(equalityCriterias).toArray();
            resolve(list)
        }).catch(e => {
            reject(e.stack || e)
        });
    })

}

