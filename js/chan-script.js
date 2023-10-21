

document.addEventListener('keydown', function(e) {
    if(e.code === 'Tab') {
        console.log('detach Tab')
        e.stopImmediatePropagation()
    }else if(e.code === 'KeyD' && e.ctrlKey) {
        console.log('detach ctrl+D')
        e.stopImmediatePropagation()
    }
}, true)

document.addEventListener('DOMContentLoaded', function() {
    processPagination()
    processThumb()
    processTagList()
    processFuckingAds()
})

function processFuckingAds() {
    const contentDiv = document.querySelector("#content")
    if(contentDiv) {
        for(let i = contentDiv.children.length - 1; i >= contentDiv.children.length - 3; --i) {
            const child = contentDiv.children[i]
            if(child.nodeName === "DIV" && [...child.attributes].map(k => k.name.length).some(k => k === 7)) {
                child.style.visibility = "hidden"
            }
        }
    }
    const ads = document.querySelectorAll("#sp1.scad")
    for(const item of ads) {
        item.remove()
    }
    const mailNotice = document.querySelectorAll("#has-mail-notice.has-mail")
    for(const item of mailNotice) {
        item.remove()
    }
    document.querySelector("#headerlogo")?.remove()
    document.querySelector("div > ul + ins")?.remove()
    document.querySelector("#news-ticker")?.remove()
}

function processTagList() {
    const tags = document.querySelectorAll('#tag-sidebar li.tag-type-artist,li.tag-type-studio,li.tag-type-copyright,li.tag-type-character')
    for(const tagLi of tags) {
        const tag = tagLi.querySelector("div")
        let postCount = "", bookCount = ""
        const childNodes = tag.querySelector('.tooltip > span').childNodes
        for(let i = 0; i < childNodes.length; i++) {
            const childNode = childNodes[i]
            if(childNode.nodeName === "#text" && childNode.textContent.startsWith("Posts:")) {
                const spanNode = childNodes[i + 1]
                if(spanNode.nodeName === "SPAN") {
                    postCount = spanNode.innerText
                }
            }else if(childNode.nodeName === "#text" && childNode.textContent.startsWith("Books:")) {
                const aNode = childNodes[i + 1]
                if(aNode.nodeName === "A") {
                    bookCount = aNode.innerText
                } 
            }
            if(postCount && bookCount) {
                break
            }
        }
        if(bookCount) {
            tag.append(`  (${postCount} / ${bookCount})`)
        }else{
            tag.append(`  (${postCount})`)
        }
    }
}

function processThumb() {
    const thumbs = document.getElementsByClassName("thumb")
    for(const thumb of thumbs) {
        const img = thumb.getElementsByTagName("img")[0]
        if(img && img.src && img.src.startsWith("https://v")) {
            img.src = 'https://s' + img.src.substr(9)
        }
    }
    console.log(`Process thumb: replace ${thumbs.length} thumbs.`)
}

function processPagination() {
    const limitPage = 50

    const pagination = document.getElementsByClassName("pagination")
    if(pagination && pagination.length) {
        const [_, currentParam] = mapHrefToParam(document.location.search)
        if(currentParam['page'] === limitPage) {
            const realPage = currentParam['real_page']

            const [prevA, nextA] = pagination[0].getElementsByTagName("a")
        
            const [prevUrl, prevParam] = mapHrefToParam(prevA.href)
            if(realPage) {
                if(realPage > limitPage) {
                    prevParam.page = limitPage
                    prevParam.real_page = realPage - 1
                    prevA.href = mapParamToHref(prevUrl, prevParam)
                }else{
                    prevParam.page = limitPage - 1
                    delete prevParam.real_page
                    prevA.href = mapParamToHref(prevUrl, prevParam)
                }
            }

            const [nextUrl, nextParam] = mapHrefToParam(nextA.href)
            if(realPage) {
                nextParam.page = limitPage
                nextParam.real_page = realPage + 1
                nextA.href = mapParamToHref(nextUrl, nextParam)
            }else{
                nextParam.page = limitPage
                nextParam.real_page = limitPage + 1
                nextA.href = mapParamToHref(nextUrl, nextParam)
            }

            if(realPage) {
                const [current] = pagination[0].getElementsByTagName("span")
                if(current) {
                    current.textContent += "(" + realPage + ")  "
                }
            }
        }
    }else{
        console.log('pagination not exist.')
    }
}

function mapHrefToParam(href) {
    const idx = href.indexOf('?')
    const url = href.slice(0, idx)
    const arr = href.slice(idx + 1).split('&').map(s => s.split('='))
    const ret = {}
    for(const [name, value] of arr) {
        ret[name] = name === 'page' || name === 'real_page' ? Number.parseInt(value) : value
    }
    return [url, ret]
}

function mapParamToHref(url, param) {
    return url + '?' + Object.entries(param).map(([n, v]) => `${n}=${v}`).join('&')
}