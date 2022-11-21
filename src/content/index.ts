function normal() {
    const link = document.getElementsByTagName('a')
    for (let i = 0; i<link.length; i++) {
        const href = link[i].href
        const index = href.indexOf('?target=')
        if (index > 0) {
            link[i].href = decodeURIComponent(href.substring(index + 8))
        }
    }
}

function weixin() {
    const link = document.getElementsByTagName('a')
    if (link[0]?.text === "继续访问") {
        link[0].click()
    }
}

function janshu() {
    const link = document.evaluate('//div[text()="继续前往"]', document).iterateNext()
    if (link) {
        link.click()
    }
}

function juejin() {
    const link = document.evaluate('//button[text()="继续访问"]', document).iterateNext()
    if (link) {
        link.click()
    }
}

normal()

if (location.host === "weixin110.qq.com") {
    weixin()
}

if (location.host === "www.jianshu.com") {
    janshu()
}

if (location.host === "link.juejin.cn") {
    juejin()
}