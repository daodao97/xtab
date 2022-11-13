export function base64FromUrl(url: string): Promise<string> {
    return new Promise((resolve, rejects) => {
        var xhr = new XMLHttpRequest();
        xhr.onload = function () {
            var reader = new FileReader();
            reader.onloadend = function () {
                resolve(reader.result as string)
            }
            reader.readAsDataURL(xhr.response);
        };
        xhr.onerror = function (e) {
            rejects(e)
        }
        xhr.open('GET', url);
        xhr.responseType = 'blob';
        xhr.send();
    })
}