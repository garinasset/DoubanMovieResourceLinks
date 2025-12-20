// ==UserScript==
// @name         Douban Movie Resource Links
// @name:zh-CN   豆瓣电影资源链接
// @namespace    https://github.com/garinasset/DoubanMovieResourceLinks
// @version      1.0.0
// @description  在豆瓣电影页面中自动添加第三方资源搜索链接（IMDb → 海盗湾，中文名 → 电影天堂）
// @match        https://movie.douban.com/subject/*
// @run-at       document-end
// @grant        none
// @updateURL    https://raw.githubusercontent.com/garinasset/DoubanMovieResourceLinks/main/DoubanMovieResourceLinks.user.js
// @downloadURL  https://raw.githubusercontent.com/garinasset/DoubanMovieResourceLinks/main/DoubanMovieResourceLinks.user.js
// ==/UserScript==

(function () {
    'use strict';

    /* =========================
     * 样式（favicon + 灰度）
     * ========================= */
    (function addStyle() {
        const style = document.createElement('style');
        style.textContent = `
            .tm-douban-resource__link {
                padding-left: 18px;
                margin-right: 4px;
                background-repeat: no-repeat;
                background-position: left center;
                background-size: 14px 14px;
                filter: grayscale(100%);
            }

            .tm-douban-resource__link--tpb {
                background-image: url("https://thepiratebay.org/favicon.ico");
            }

            .tm-douban-resource__link--dytt {
                background-image: url("https://www.dytt8899.com/favicon.ico");
            }
        `;
        document.head.appendChild(style);
    })();

    /* =========================
     * 工具函数
     * ========================= */

    // 从 <title> 中获取最干净的中文名
    function getCleanChineseTitle() {
        // 例：新世界 (豆瓣)
        return (document.title || '')
            .replace(/\s*\(豆瓣\)\s*$/, '')
            .trim();
    }

    // 使用 POST 提交电影天堂搜索（GB2312 编码）
    function openDyttSearch(keyword) {
        const form = document.createElement('form');
        form.action = 'https://www.dytt8899.com/e/search/index.php';
        form.method = 'POST';
        form.target = '_blank';
        form.acceptCharset = 'gb2312';

        const fields = {
            keyboard: keyword,
            show: 'title,smalltext',
            tempid: '1',
            classid: '0'
        };

        for (const name in fields) {
            const input = document.createElement('input');
            input.type = 'hidden';
            input.name = name;
            input.value = fields[name];
            form.appendChild(input);
        }

        document.body.appendChild(form);
        form.submit();
        form.remove();
    }

    /* =========================
     * 主逻辑
     * ========================= */

    function insertResourceLinks() {
        const info = document.querySelector('#info');
        if (!info) return false;

        // 防止重复插入
        if (info.querySelector('.tm-douban-resource__container')) return true;

        // 找 IMDb
        const imdbLabel = Array.from(info.querySelectorAll('span.pl'))
            .find(span => span.textContent.trim() === 'IMDb:');
        if (!imdbLabel) return false;

        const imdbTextNode = imdbLabel.nextSibling;
        if (!imdbTextNode || imdbTextNode.nodeType !== Node.TEXT_NODE) return false;

        const imdbId = imdbTextNode.textContent.trim();
        if (!/^tt\d+$/.test(imdbId)) return false;

        // 中文片名
        const cnTitle = getCleanChineseTitle();
        if (!cnTitle) return false;

        // 构建 DOM
        const container = document.createElement('span');
        container.className = 'tm-douban-resource__container';
        container.innerHTML = `
            <span class="pl">磁力资源:</span>
            <a class="tm-douban-resource__link tm-douban-resource__link--tpb"
               href="https://thepiratebay.org/search.php?q=${imdbId}"
               target="_blank" rel="noopener noreferrer">
               海盗湾
            </a>
            &nbsp;/&nbsp;
            <a class="tm-douban-resource__link tm-douban-resource__link--dytt"
               href="javascript:void(0);">
               电影天堂
            </a>
        `;

        container.querySelector('.tm-douban-resource__link--dytt')
            .addEventListener('click', () => openDyttSearch(cnTitle));

        const br = document.createElement('br');
        const imdbBr = imdbTextNode.nextSibling;

        if (imdbBr && imdbBr.tagName === 'BR') {
            imdbBr.after(container, br);
        } else {
            info.append(container, br);
        }

        return true;
    }

    /* =========================
     * 等待 DOM（兼容豆瓣 SPA）
     * ========================= */

    function waitForInfoReady() {
        if (insertResourceLinks()) return;

        const observer = new MutationObserver(() => {
            if (insertResourceLinks()) {
                observer.disconnect();
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });

        // 兜底延迟
        setTimeout(() => {
            insertResourceLinks();
            observer.disconnect();
        }, 3000);
    }

    waitForInfoReady();
})();
