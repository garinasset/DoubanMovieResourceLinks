// ==UserScript==
// @name         Douban Movie Resource Links
// @name:zh-CN   豆瓣电影资源链接
// @namespace    https://github.com/garinasset/DoubanMovieResourceLinks
// @version      1.0.0
// @description  在豆瓣电影页面中自动添加第三方资源搜索链接
// @match        https://movie.douban.com/subject/*
// @run-at       document-end
// @grant        none
// @updateURL    https://raw.githubusercontent.com/garinasset/DoubanMovieResourceLinks/main/DoubanMovieResourceLinks.user.js
// @downloadURL  https://raw.githubusercontent.com/garinasset/DoubanMovieResourceLinks/main/DoubanMovieResourceLinks.user.js
// ==/UserScript==


(function () {
    'use strict';

    /** =========================
     * favicon 样式（追加）
     * ========================= */
    (function addFaviconStyle() {
        const style = document.createElement('style');
        style.textContent = `
            .tm-movie-links a {
                padding-left: 18px;
                background-repeat: no-repeat;
                background-position: left center;
                background-size: 14px 14px;
            }

            .tm-movie-links a.tm-tpb {
                background-image: url("https://thepiratebay.org/favicon.ico");
            }

            .tm-movie-links a.tm-dytt {
                background-image: url("https://www.dytt8899.com/favicon.ico");
            }
        `;
        document.head.appendChild(style);
    })();

    /** =========================
     * 工具函数
     * ========================= */

    function getCleanChineseTitle() {
        const title = document.title || '';
        // 例：新世界 (豆瓣)
        return title.replace(/\s*\(豆瓣\)\s*$/, '').trim();
    }

    function openDyttSearch(keyword) {
        const form = document.createElement('form');
        form.action = 'https://www.dytt8899.com/e/search/index.php';
        form.method = 'POST';
        form.target = '_blank';

        // ★ 关键：必须是 GBK / GB2312
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

    function insertLinks() {
        const info = document.querySelector('#info');
        if (!info) return false;

        // 防重复
        if (info.querySelector('.tm-movie-links')) return true;

        /** ===== IMDb ===== */
        const imdbLabel = Array.from(info.querySelectorAll('span.pl'))
            .find(span => span.textContent.trim() === 'IMDb:');

        if (!imdbLabel) return false;

        const imdbTextNode = imdbLabel.nextSibling;
        if (!imdbTextNode || imdbTextNode.nodeType !== Node.TEXT_NODE) return false;

        const imdbId = imdbTextNode.textContent.trim();
        if (!/^tt\d+$/.test(imdbId)) return false;

        /** ===== 中文名 ===== */
        const cnTitle = getCleanChineseTitle();
        if (!cnTitle) return false;

        /** ===== 创建 DOM ===== */
        const container = document.createElement('span');
        container.className = 'tm-movie-links';
        container.innerHTML = `
            <span class="pl">磁力资源:</span>
            <a class="tm-tpb"
               href="https://thepiratebay.org/search.php?q=${imdbId}"
               target="_blank" rel="noopener noreferrer">
               海盗湾
            </a>
            &nbsp;/&nbsp;
            <a href="javascript:void(0);" class="tm-dytt tm-dytt-link">
               电影天堂
            </a>
        `;

        container.querySelector('.tm-dytt-link')
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

    /** =========================
     * 等待 DOM（豆瓣 SPA）
     * ========================= */

    function waitForInfo() {
        if (insertLinks()) return;

        const observer = new MutationObserver(() => {
            if (insertLinks()) {
                observer.disconnect();
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });

        // 兜底延迟
        setTimeout(() => {
            insertLinks();
            observer.disconnect();
        }, 3000);
    }

    waitForInfo();
})();
