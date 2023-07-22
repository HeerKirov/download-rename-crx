import conf from "../config.local.js"

const rules = conf.rules.map(rule => ({
    referrer: rule.referrer && new RegExp(rule.referrer, "i"),
    url: rule.url ? new RegExp(rule.url, "i") : undefined,
    filename: rule.filename && new RegExp(rule.filename, "i"),
    includeExtension: rule.includeExtension,
    rename: rule.rename,
    secondaryTransfer: rule.secondaryTransfer
}))

const metadataCache = {}

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
        }else if(rule.secondaryTransfer === 'e-hentai') {
            const args = {}
            for(const key of Object.keys(res.groups)) {
                args[key] = res.groups[key]
            }
            for(const key of Object.keys(args)) {
                const value = args[key]
                finalName = finalName.replace(`$<${key}>`, value)
            }
            const pid = args['PID']
            // if(metadataCache[pid]) {
            //     for(const key of Object.keys(res.groups)) {
            //         const value = res.groups[key]
            //         finalName = finalName.replace(`$<${key}>`, value)
            //     }
            //     console.log('suggest filename:', finalName + (extension ? "." + extension : ""))
            //     suggest({filename: finalName + (extension ? "." + extension : "")})
            // }else
            {
                const url = `https://e-hentai.org/g/${pid}/*`
                console.log("look for ", url)
                chrome.tabs.query({currentWindow: true, url}, tabs => {
                    // chrome.tabs.sendMessage(tabs[0].id, {type: "download-find-transfer-args", args}, response => {
                    //     console.log(`receive download-find-transfer-args`, response)
                    //     if(response) {
                    //         for(const key of Object.keys(response)) {
                    //             const value = response[key]
                    //             if(value) {
                    //                 finalName += `\\${key}:${value}`
                    //             }
                    //         }
                    //         // metadataCache[pid] = true
                    //     }
                        
                    //     console.log('suggest filename:', finalName + (extension ? "." + extension : ""))
                    //     suggest({filename: finalName + (extension ? "." + extension : "")})
                    // })
                })
    
                return true
            }
        }else if(rule.secondaryTransfer === "e-hentai-active") {
            chrome.tabs.query({currentWindow: true, active: true, url: "https://e-hentai.org/s/*/*"}, tabs => {
                if(tabs.length > 0) {
                    chrome.tabs.sendMessage(tabs[0].id, {type: "download-find-active-args", args: {filename}}, response => {
                        if(response) {
                            for(const key of Object.keys(response)) {
                                const value = response[key]
                                finalName = finalName.replace(`$<${key}>`, value)
                            }
                            
                            console.log('suggest filename:', finalName + (extension ? "." + extension : ""))
                            suggest({filename: finalName + (extension ? "." + extension : "")})
                        }else{
                            console.error("response is empty.")
                            suggest({filename})        
                        }
                    })
                }else{
                    console.error("Cannot find active ehentai gallery tab.")
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