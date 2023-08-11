
document.addEventListener('DOMContentLoaded', function() {
    const re = new RegExp("https://e-hentai.org/g/(\\d+)/([^\\?]+)")
    const res = re.exec(document.location.href)
    const gid = res[1]
    const token = res[2]

    chrome.runtime.sendMessage({
        type: "ehentai-g-report",
        gid,
        token
    })
})

chrome.runtime.onMessage.addListener(function (msg, sender, response) {
    if(msg && msg.type === "download-find-transfer-args") {
        const pid = msg.args["PID"]

        const re = new RegExp("https://e-hentai.org/g/" + pid + "/([^\\?]+)")
        const res = re.exec(document.location.href)
        if(!res) {
            response(undefined)
            return
        }
        const token = res.groups[1]
        if(!token) {
            response(undefined)
            return
        }
        response({
            t: token,
            a: ""
        })
    }
})