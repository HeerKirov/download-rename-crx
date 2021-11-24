export default {
    //规则列表
    rules: [
        {
            //匹配referrer。填写正则表达式，并提取其中的具名变量
            referrer: "https://chan.sankakucomplex.com/post/show/(?<PID>\\d+)",
            //根据文件扩展名过滤
            includeExtension: ["jpg", "jpeg", "gif", "webp", "webm", "mp4"],
            //生成新的名称。名称中的变量从之前的正则匹配中取得
            rename: "sankakucomplex_$<PID>"
        }
    ]
}