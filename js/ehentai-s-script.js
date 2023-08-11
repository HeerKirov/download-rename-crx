
document.addEventListener('DOMContentLoaded', function() {
    const re = new RegExp("https://e-hentai.org/s/(\\S+)/(\\d+)-(\\d+)")
    const res = re.exec(document.location.href)
    const pname = res[1]
    const pid = res[2]
    const part = res[3]

    chrome.runtime.sendMessage({
        type: "ehentai-s-report",
        pname,
        pid,
        part
    })
})
