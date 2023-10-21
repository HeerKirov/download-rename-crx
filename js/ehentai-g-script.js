
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
    const banList = ["OP", "原批", "喷", "丑", "爹", "狗叫", "滚", "孝", "米黑", "米哈游", "萎哥", "二苇", "二萎", "幕勾"]
    const banUsers = ["pex019", "G5SOr3K", "Ardyn54", "wlk", "TrinitySS", "哦个好家伙", "Viola64", "zjm13756501613", "二苇渡江"]
    const warnTags = ["genshin impact", "honkai star rail"]
    
    const divs = document.querySelectorAll("div#cdiv > div.c1")
    const tags = [...document.querySelectorAll("#taglist a")]
    const parodyCount = tags.filter(a => a.id.startsWith("ta_parody")).length
    const warning = tags.some(a => warnTags.includes(a.textContent)) && parodyCount < 2
    
    const cn = []
    const bad = []
    const banned = []
    const bannedUser = []
    for(let i = 0; i < divs.length; ++i) {
        const div = divs[i]
        if(div.querySelector("a[name=ulcomment]")) {
            continue
        }
        const c3 = div.querySelector("div.c3 > a")
        if(c3 && c3.textContent) {
            if(banUsers.includes(c3.textContent)) {
                bannedUser.push(i)
            }
        }
        const c5 = div.querySelector("div.c5 > span")
        if(c5) {
            const score = parseInt(c5.textContent)
            if(score < -20) {
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
    if(warning && cn.length >= 2 && (bad.length >= 1 || bannedUser.length >= 1 || banned.length >= 1)) {
        const list = [...new Set([...cn, ...bad, ...banned, ...bannedUser]).values()]
        for(const idx of list) {
            const div = divs[idx]
            if(bannedUser.includes(idx) || banned.includes(idx) || bad.includes(idx) || cn.includes(idx)) {
                div.querySelector("div.c6")?.remove()
            }   
        }
    }else if((cn.length >= 2 && bad.length >= 1) || banned.length >= 1 || bannedUser.length >= 1) {
        const list = [...new Set([...cn, ...bad, ...banned, ...bannedUser]).values()]
        for(const idx of list) {
            const div = divs[idx]
            const c6 = div.querySelector("div.c6")
            if(bannedUser.includes(idx)) {
                const c3 = div.querySelector("div.c3 > a")
                c3.style = "color: black; background-color: black"
            }
            if(bannedUser.includes(idx) || banned.includes(idx) || bad.includes(idx)) {
                c6.style = "color: black; background-color: black"
            }else{
                c6.style = "color: grey; background-color: grey"
            }
        }
    }
}
