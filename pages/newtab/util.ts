import { base64FromUrl } from '~/utils'

async function fetchBGImg() {
    const res = await fetch('https://api.ixiaowai.cn/gqapi/gqapi.php', {
        method: 'GET',
        mode: 'cors',
        credentials: 'include'
    })
    return res.url
}

async function fetchBGImg2() {
    const res = await fetch('https://bingw.jasonzeng.dev/?index=random', {
        method: 'GET',
        mode: 'cors',
        credentials: 'include'
    })
    return res.url
}

async function fetchBGImg3() {
    const res = await fetch("https://source.unsplash.com/random/1024x600", {
        method: 'GET',
        mode: 'cors',
        credentials: 'include'
    })
    return res.imagelists.url
}

type GetImage = () => Promise< string>;

export async function getImageBase64(): Promise<string> {
    const url = await getImage()
    const data = await base64FromUrl(url)
    return data
  }

export const getImage : GetImage = fetchBGImg2
