import { useLocalStorage } from '@vueuse/core'

export const tabList = useLocalStorage('webext-tab-list', 'tabList', { listenToStorageChanges: true })
