# DoubanMovieResourceLinks

**DoubanMovieResourceLinks**（豆瓣电影 · 资源搜索）是一个 Tampermonkey/Greasemonkey 用户脚本：实现在“豆瓣电影”页面信息栏，添加相应“电影”的“第三方资源搜索”链接，例如海盗湾等，点击即可跳转到对应电影的第三方资源搜索结果页面，便利”资源“搜索。...当下正在扩展更多资源。

![历史效果图](https://github.com/user-attachments/assets/99b48de3-6a50-4329-8269-2c27afd0992f)


## 功能特性

- 自动解析电影“中文名”和“IMDb ID”
- 支持
    - 海盗湾
    - 等等等...使用有惊喜

- 支持豆瓣 SPA 页面（无需刷新）
- 无广告 / 无统计 / 无后台请求

## 安装

1. 安装 **Tampermonkey** 或 **Greasemonkey** 浏览器扩展
2. 点击 [安装脚本](https://raw.githubusercontent.com/garinasset/DoubanMovieResourceLinks/main/DoubanMovieResourceLinks.user.js) 按钮，自动添加到扩展中
3. 打开豆瓣电影详情页，即可在IDMb信息下方看到“第三方资源”搜索链接

## 更新与反馈

- GitHub 仓库：[https://github.com/garinasset/DoubanMovieResourceLinks](https://github.com/garinasset/DoubanMovieResourceLinks)  
- Issues & Bug 报告：[https://github.com/garinasset/DoubanMovieResourceLinks/issues](https://github.com/garinasset/DoubanMovieResourceLinks/issues)  
- 自动更新：脚本内配置了 `@updateURL` 指向 GitHub Raw 文件，Tampermonkey 会自动检查更新

## 许可证

MIT License
