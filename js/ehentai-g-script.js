
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

    processComments()
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

function processComments() {
    const re = /.*[\u4e00-\u9fa5]+.*$/
    const banList = ["OP", "批", "喷", "丑", "爹", "狗", "叫", "滚", "孝"]
    
    const divs = document.querySelectorAll("div#cdiv > div.c1")
    
    const cn = []
    const bad = []
    const banned = []
    for(let i = 0; i < divs.length; ++i) {
        const div = divs[i]
        if(div.querySelector("a[name=ulcomment]")) {
            continue
        }
        const c5 = div.querySelector("div.c5 > span")
        if(c5) {
            const score = parseInt(c5.textContent)
            if(score < -10) {
                bad.push(i)
            }
        }
        const c6 = div.querySelector("div.c6")
        if(c6?.textContent) {
            if(re.test(c6.textContent)) {
                cn.push(i)
            }
            for(const ban of banList) if(c6.textContent.includes(ban)) {
                banned.push(i)
                break
            }
        }
    }
    if((cn.length >= 2 && bad.length >= 1) || banned.length >= 1) {
        const list = [...new Set([...cn, ...bad, ...banned]).values()]
        for(const idx of list) {
            const div = divs[idx]
            const c6 = div.querySelector("div.c6")
            c6.style = "color: black; background-color: black"
        }
    }
}
