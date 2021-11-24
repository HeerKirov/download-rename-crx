import conf from "../config.local.js"

const rules = conf.rules.map(rule => ({
    referrer: rule.referrer && new RegExp(rule.referrer, "i"),
    filename: rule.filename && new RegExp(rule.filename, "i"),
    includeExtension: rule.includeExtension,
    rename: rule.rename
}))

chrome.downloads.onDeterminingFilename.addListener((item, suggest) => {
    const { filename, finalUrl, url, mime, referrer } = item
    const [ name, extension ] = splitNameAndExtension(filename)
    for(const rule of rules) {
        if(rule.includeExtension && (!extension || !rule.includeExtension.includes(extension))) break
        let finalName = rule.rename

        if(rule.referrer) {
            const res = rule.referrer.exec(referrer)
            if(!res) {
                console.log("rule not matched bacause referrer is not matched.")
                break
            }
            for(const key of Object.keys(res.groups)) {
                const value = res.groups[key]
                finalName = finalName.replace(`$<${key}>`, value)
            }
        }
        if(rule.filename) {
            const res = rule.filename.exec(name)
            if(!res) break
            for(const key of Object.keys(res.groups)) {
                const value = res.groups[key]
                finalName = finalName.replace(`$<${key}>`, value)
            }
        }

        console.log(`matched rule.`, rule)
        suggest({filename: finalName + (extension ? "." + extension : "")})
        break
    }  
})

function splitNameAndExtension(filename) {
    const i = filename.lastIndexOf(".")
    return i >= 0 ? [filename.substr(0, i), filename.substr(i + 1)] : [filename, null]
}
