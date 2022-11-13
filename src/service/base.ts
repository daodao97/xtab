import Dexie, { Table } from 'dexie';

export interface Tabs {
    tabId: number
    windowId: number
    lastActiveTime: number
    pinned: number
    groupId: number
}

export interface RecycleTabs {
    tabId: number,
    windowId: number,
    ico: string,
    url: string,
    title: string,
    groupId: number
}


class DB extends Dexie {
    public tabs!: Table<Tabs, number>; // id is number in this case
    public recycle_tabs!: Table<RecycleTabs, number>

    public constructor() {
        super("xtab.cc");
        this.version(1).stores({
            tabs: "++tabId,windowId,pinned,groupId,lastActiveTime",
            recycle_tabs: "++tabId,windowId,url,title,groupId"
        });
    }
}

export const db = new DB();
