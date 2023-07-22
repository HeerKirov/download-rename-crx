

function download() {
    const aList = document.querySelectorAll("article > .sc-1vjtieq-1.eLScmM a.sc-xvj0xk-1.iyApTb")
    if(aList.length <= 0) {
        alert("未发现图片列表。")
        console.warn("<a> list:", aList)
        return []
    }else{
        const links = []
        for(const a of aList) {
            links.push(a.href)
        }

        console.log("<a href> list:", links)

        return links
    }
}

chrome.runtime.onMessage.addListener(function (msg, sender, response) {
  if(msg === "fanbox-download-all-images") {
    const aList = download()
    alert(`共${aList.length}个文件可下载。`)
    response(aList)
  }
})