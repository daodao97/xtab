
import { Tab } from 'chrome'
import { ConfigOptions } from './default'

function matchExclude(url: string, keywords: string) {
    const _url = new URL(url)
    if (_url.protocol !== "http:" && _url.protocol !== "https:") {
        return false
    }
    const parts = keywords.split(',')
    for (let i = 0; i < parts.length; i++) {
        const tmp = parts[i]
        if (_url.host.includes(tmp)) {
            return true
        }
    }

    return false
}

export async function justOneTab(tab: Tab, config: ConfigOptions): Promise<void> {
    if (matchExclude(tab.url!, config.just_one_tab_exclude)) {
        return
    }
    const exist = await chrome.tabs.query({ url: tab.url.split('#')[0] })
    const other = exist.filter(e => e.id !== tab.id)
    console.log(tab.url, other)
    if (other.length > 0) {
        other.forEach(async (item, index) => {
            if (index > 0) {
                await chrome.tabs.remove(item.id!)
            }
        })
        await chrome.tabs.remove(tab.id!)
        await chrome.tabs.update(other[0].id!, { active: true })
    }
}