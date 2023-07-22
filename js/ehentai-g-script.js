

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