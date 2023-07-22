
document.addEventListener('DOMContentLoaded', function() {
    processDownloadLink()
})

function processDownloadLink() {
    
}

chrome.runtime.onMessage.addListener(function (msg, sender, response) {
    if(msg && msg.type === "download-find-active-args") {
        const re = new RegExp("https://e-hentai.org/s/\\S+/(\\d+)-(\\d+)")
        const res = re.exec(document.location.href)
        if(!res) {
            response(undefined)
            return
        }
        const pid = res[1]
        const part = res[2]
        response({
            PID: pid,
            PART: part,
            FILENAME: msg.args["filename"]
        })
    }
})