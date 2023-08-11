import conf from "../config.local.js"

const rules = conf.rules.map(rule => ({
    referrer: rule.referrer && new RegExp(rule.referrer, "i"),
    url: rule.url ? new RegExp(rule.url, "i") : undefined,
    filename: rule.filename && new RegExp(rule.filename, "i"),
    includeExtension: rule.includeExtension,
    rename: rule.rename,
    secondaryTransfer: rule.secondaryTransfer
}))

chrome.runtime.onMessage.addListener(function(msg, sender, response) {
    if(typeof msg === "object") {
        if(msg.type === "ehentai-s-report") {
            const { pname, pid, part } = msg
            chrome.storage.session.set({
                [`ehentai-s-hash:${pid}-${part}`]: pname
            })
        }else if(msg.type === "ehentai-g-report") {
            const { gid, token } = msg
            chrome.storage.session.set({
                [`ehentai-g-token:${gid}`]: token
            })
        }
    }
})

chrome.downloads.onDeterminingFilename.addListener((item, suggest) => {
    const { filename, finalUrl, url, mime, referrer } = item
    const [ _, extension ] = splitNameAndExtension(filename)
    console.log("filename:", filename)
    console.log("finalUrl:", finalUrl)
    console.log("url:", url)
    console.log("referrer:", referrer)
    console.log("mime:", mime)

    let rule = null
    let res = null
    for (const r of rules) {
        if(r.includeExtension && (!extension || !r.includeExtension.includes(extension))) continue
        
        if(r.referrer) {
            res = r.referrer.exec(referrer)
            if(!res) {
                continue
            }
        }else if(r.url) {
            res = r.url.exec(url)
            if(!res) {
                continue
            }
        }
        rule = r
        break
    }

    if(rule) {
        console.log(`matched rule.`, rule)
        let finalName = rule.rename
    
        if(rule.secondaryTransfer === 'sankakucomplex') {
            const args = {}
            for(const key of Object.keys(res.groups)) {
                args[key] = res.groups[key]
            }
            chrome.tabs.query({currentWindow: true, url: referrer}, tabs => {
                chrome.tabs.sendMessage(tabs[0].id, {type: "download-find-transfer-args", args}, response => {
                    console.log(`receive download-find-transfer-args`, response)
                    for(const key of Object.keys(response)) {
                        const value = response[key]
                        finalName = finalName.replace(`$<${key}>`, value)
                    }
                    
                    console.log('suggest filename:', finalName + (extension ? "." + extension : ""))
                    suggest({filename: finalName + (extension ? "." + extension : "")})
                })
            })

            return true
        }else if(rule.secondaryTransfer === 'e-hentai-original') {
            //点击“下载原始文件”时的下载项。特征是url可解析，能从中获得galleryId, pageNum。
            //为何补全信息，还需要向页面发送事件，获取imageHash。
            const args = {}
            for(const key of Object.keys(res.groups)) {
                args[key] = res.groups[key]
            }
            for(const key of Object.keys(args)) {
                const value = args[key]
                finalName = finalName.replace(`$<${key}>`, value)
            }

            const key = `ehentai-s-hash:${args['PID']}-${args['PART']}`
            chrome.storage.session.get([key]).then(result => {
                if(result[key]) {
                    console.log(`get pname of ${args['PID']}-${args['PART']} from session storage: ${result[key]}`)
                    finalName = finalName.replace(`$<PNAME>`, result[key])
                    console.log('suggest filename:', finalName + (extension ? "." + extension : ""))
                    suggest({filename: finalName + (extension ? "." + extension : "")})
                }else{
                    chrome.tabs.query({currentWindow: true, url: `https://e-hentai.org/s/*/${args['PID']}-${args['PART']}*`}, tabs => {
                        const re = new RegExp("https://e-hentai.org/s/(\\S+)/(\\d+)-(\\d+)")
                        for(const tab of tabs) {
                            const res = re.exec(tab.url)
                            if(res) {
                                const pname = res[1]
                                const pid = res[2]
                                const part = res[3]
                                if(pid === args['PID'] && part === args['PART']) {
                                    finalName = finalName.replace(`$<PNAME>`, pname)
        
                                    console.log('suggest filename:', finalName + (extension ? "." + extension : ""))
                                    suggest({filename: finalName + (extension ? "." + extension : "")})
        
                                    return
                                }
                            }
                        }
                        //tips: ehentai的原始文件下载有失败重下的可能，此时会重新获取建议，但很可能tab被关了导致建议失败。针对这种情况可以优化一下。
        
                        //else
                        console.error(`Cannot find e-hentai.org/s/*/${args['PID']}-${args['PART']} tab.`)
                        suggest({filename})
                    })
                }
            })

            
            return true
        }else if(rule.secondaryTransfer === "e-hentai-save-as") {
            //右键另存为图片，这种模式无法从下载项中获取任何信息。解决思路是利用“下载时一定位于当前页面”的巧合，将当前激活页面当作原始页。
            //从URL就能获取所需的imageHash, galleryId, pageNum。
            chrome.tabs.query({currentWindow: true, active: true, url: "https://e-hentai.org/s/*/*"}, tabs => {
                if(tabs.length > 0) {
                    const re = new RegExp("https://e-hentai.org/s/(\\S+)/(\\d+)-(\\d+)")
                    const res = re.exec(tabs[0].url)
                    if(res) {
                        const pname = res[1]
                        const pid = res[2]
                        const part = res[3]
                        finalName = finalName.replace(`$<PNAME>`, pname)
                        finalName = finalName.replace(`$<PID>`, pid)
                        finalName = finalName.replace(`$<PART>`, part)

                        console.log('suggest filename:', finalName + (extension ? "." + extension : ""))
                        suggest({filename: finalName + (extension ? "." + extension : "")})
                    }else{
                        console.error(`Cannot analyse tab url ${tabs[0].url}.`)
                        suggest({filename})
                    }
                }else{
                    console.error("Cannot find active e-hentai.org/s/ tab.")
                    suggest({filename})
                }
            })
            return true
        }else{
            for(const key of Object.keys(res.groups)) {
                const value = res.groups[key]
                finalName = finalName.replace(`$<${key}>`, value)
            }

            console.log('suggest filename:', finalName + (extension ? "." + extension : ""))
            suggest({filename: finalName + (extension ? "." + extension : "")})
        }
    }
})

function splitNameAndExtension(filename) {
    const i = filename.lastIndexOf(".")
    return i >= 0 ? [filename.substr(0, i), filename.substr(i + 1)] : [filename, null]
}

chrome.contextMenus.create({
    title: "下载全部图片", 
    contexts:["page"],
    id: "fanbox-download-all-images",
    targetUrlPatterns: ["https://www.fanbox.cc/*/posts/*"], 
})

chrome.contextMenus.onClicked.addListener((e, tab) => {
    if(e.menuItemId === "fanbox-download-all-images") {
        chrome.tabs.sendMessage(tab.id, "fanbox-download-all-images", async function (aList) {
            chrome.notifications.create(null, {
                contextMessage: `共有${aList.length}个文件将被下载。`
            })
            for (const url of aList) {
                chrome.downloads.download({url})
                await sleep(500)
            }
        })
    }
})

function sleep(ms) {
    return new Promise(resolve => {
        setTimeout(() => resolve(), ms)
    })
}