export interface TabGroupRule {
    title: string;
    color: string;
    url: string;
}

export interface ConfigOptions {
    auto_recycle_tab: boolean;
    auto_recycle_max_tab_num: number;
    just_one_tab: boolean;
    just_one_tab_exclude: string;
    auto_jump: boolean;
    tab_group: boolean;
    tab_group_auto_collapsed_inactivity: boolean;
    tab_group_mode: number;
    tab_group_rules: TabGroupRule[];
}

export const DefaultConfig = {
    auto_recycle_tab: true,
    auto_recycle_max_tab_num: 20,
    just_one_tab: true,
    just_one_tab_exclude: "",
    auto_jump: true,
    tab_group: true,
    tab_group_auto_collapsed_inactivity: true,
    tab_group_mode: 1, // 1 按域名自动分组, 2 按一级域名自动分组, 3 按规则分组
    tab_group_rules: []
}

export const getConfig = async (): Promise<ConfigOptions> => {
    return new Promise((resolve, reject) => {
        chrome.storage.sync.get('config', function (data) {
            if (data.config) {
                resolve(data.config as ConfigOptions)
            } else {
                resolve(DefaultConfig)
            }
        })
    })
}

export const saveConfig = async (config: ConfigOptions): Promise<boolean> => {
    return new Promise((resolve, reject) => {
        chrome.storage.sync.set({ config }).then(_ => {
            resolve(true)
        }).catch(e => {
            reject(e)
        }) 
    })
}