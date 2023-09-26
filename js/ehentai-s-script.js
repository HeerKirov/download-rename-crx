
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

    processDonwloadAnchor(pname, pid, part)
})

function processDonwloadAnchor(pname, pid, part) {
    const i7 = document.querySelector("#i7")
    if(!i7) {
        console.warn("Cannot find div#i7.")
        return
    }

    if(!i7.querySelector("a")) {
        const img = document.querySelector("#img")
        if(!img) {
            console.warn("Cannot find #img.")
            return
        }
        const i = document.createElement("img")
        i.src = "https://ehgt.org/g/mr.gif"
        i.class = "mr" 
        const anchor = document.createElement("a")
        anchor.textContent = "Download original from img link"
        anchor.onclick = () => {
            const filename = `ehentai_${pid}_${part}_${pname}`
            chrome.runtime.sendMessage({type: "download", url: img.src, filename})
        }
        anchor.href = "#"
        const t = document.createTextNode(" ")
        i7.appendChild(t)
        i7.appendChild(i)
        i7.appendChild(anchor)
        console.log("img link appended.")
    }
}