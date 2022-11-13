import { db, RecycleTabs } from './base'

export const table = db.recycle_tabs

export function create(tab: RecycleTabs): Promise<Boolean> {
    return new Promise((resolve, reject) => {
        db.transaction('rw', db.recycle_tabs, async () => {
            await db.recycle_tabs.add(tab)
            resolve(true)
        }).catch(e => {
            reject(e.stack || e)
        });
    })
}


export function removeBy(where: Record<string, any>): Promise<Boolean> {
    return new Promise((resolve, reject) => {
        db.transaction('rw', db.recycle_tabs, async () => {
            await db.recycle_tabs.where({...where}).delete()
            resolve(true)
        }).catch(e => {
            reject(e.stack || e)
        });
    })
}

export function removeNotExistWindow(windowId: number[]): Promise<Boolean> {
    return new Promise((resolve, reject) => {
        db.transaction('rw', db.recycle_tabs, async () => {
            await db.recycle_tabs.filter((item) => {
                return !windowId.includes(item.windowId)
            }).delete()
            resolve(true)
        }).catch(e => {
            reject(e.stack || e)
        });
    })
}