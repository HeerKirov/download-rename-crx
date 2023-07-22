
function createElement(tagName, attr, children) {
    const ele = document.createElement(tagName)
    if(attr) {
        for(const a in attr) {
            ele[a] = attr[a]
        }
    }
    if(children) {
        for(const child of children) {
            ele.appendChild(child)
        }
    }
    return ele
}

chrome.runtime.onMessage.addListener(function (msg, sender, response) {
    if(msg && msg.type === "download-find-transfer-args") {
        const fakePID = msg.args["PID"]
        const meta = document.querySelector('meta[property="og:title"]')
        if(meta) {
            if(meta.content.startsWith("Post")) {
                const realPID = parseInt(meta.content.substring("Post".length))
                console.log('real PID is ' + realPID)
                response({"PID": realPID})
            }else{
                console.warn('og:title meta\'s content is incorrect: ', meta.content)
                response(msg.args)    
            }
        }else{
            console.warn('cannot find og:title meta.')
            response(msg.args)
        }
    }
})

document.addEventListener('DOMContentLoaded', function() {
    processHashPid()
	processLink()
    processBooks()
})

function processHashPid() {
    const meta = document.querySelector('meta[property="og:title"]')
    if(meta && meta.content.startsWith("Post")) {
        const realPID = parseInt(meta.content.substring("Post".length))
        console.log('real PID is ' + realPID)
        document.location.hash = `?pid=${realPID}`
    }
}

function processLink() {
    const lastIndexOfSplit = location.href.lastIndexOf('/')
    const pid = location.href.substring(lastIndexOfSplit + 1)

    const statsDiv = document.getElementById("stats")
    const hrefA = document.getElementById("highres")

    const li = createElement('li', {style: 'margin-top: 12px'}, [
        document.createTextNode('Original S: '),
        createElement('a', {href: 'https://s' + hrefA.href.substr(9), text: hrefA.text})
    ])
    const toBeta = createElement('li', null, [
        document.createTextNode('Go to Beta: '),
        createElement('a', {href: '//beta.sankakucomplex.com/post/show/' + pid, text: pid})
    ])

    statsDiv.appendChild(li).appendChild(toBeta)

    const imageLink = document.getElementById("image-link")
    if(imageLink) {
        if(imageLink.href && imageLink.href.startsWith("https://v")) {
            console.log('origin link: ' + imageLink.href)
            imageLink.href = 'https://s' + imageLink.href.substr(9)
        }
        const imageLinkImg = imageLink.getElementsByTagName("img")[0]
        if(imageLinkImg && imageLinkImg.src && imageLinkImg.src.startsWith("https://v")) {
            console.log('origin image src: ' + imageLinkImg.src)
            imageLinkImg.src = 'https://s' + imageLinkImg.src.substr(9)
        }
    }else{
        console.log('#image-link not found.')
    }
}

function processBooks() {
    const statusNotice = document.querySelectorAll(".content .status-notice")
    if(statusNotice && statusNotice.length) {
        statusNotice.forEach(sn => {
            if(sn.id.startsWith("pool")) {
                const bookId = sn.id.slice(4)
                sn.appendChild(document.createTextNode("("))
                sn.appendChild(createElement("a", {
                    href: `https://chan.sankakucomplex.com/pool/show/${bookId}`,
                    text: `Legacy pool: ${bookId}`
                }))
                sn.appendChild(document.createTextNode(")"))
            }
        })
    }
}