
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

document.addEventListener('DOMContentLoaded', function() {
	const lastIndexOfSplit = location.href.lastIndexOf('/')
    const pid = location.href.substring(lastIndexOfSplit + 1)

    console.log(pid)

    const statsDiv = document.getElementById("stats")
    const hrefA = document.getElementById("highres")
    const ul = statsDiv.getElementsByTagName("ul")[0]

    const li = createElement('li', {style: 'margin-top: 12px'}, [
        document.createTextNode('Original S: '),
        createElement('a', {href: 'https://s' + hrefA.href.substr(9), text: hrefA.text})
    ])
    const toBeta = createElement('li', null, [
        document.createTextNode('Go to Beta: '),
        createElement('a', {href: '//beta.sankakucomplex.com/post/show/' + pid, text: pid})
    ])

    ul.appendChild(li).appendChild(toBeta)

    const imageLink = document.getElementById("image-link")
    if(imageLink && imageLink.href) {
        console.log('origin link: ' + imageLink.href)
        imageLink.href = 'https://s' + imageLink.href.substr(9)
    }
})