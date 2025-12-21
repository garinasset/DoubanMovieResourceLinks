// ==UserScript==
// @name         Douban Movie Resource Links
// @name:zh-CN   豆瓣电影资源链接
// @namespace    https://github.com/garinasset/DoubanMovieResourceLinks
// @version      1.0.1
// @description  在豆瓣电影页面中自动添加第三方资源搜索链接
// @match        https://movie.douban.com/subject/*
// @run-at       document-end
// @grant        none
// @updateURL    https://raw.githubusercontent.com/garinasset/DoubanMovieResourceLinks/main/DoubanMovieResourceLinks.user.js
// @downloadURL  https://raw.githubusercontent.com/garinasset/DoubanMovieResourceLinks/main/DoubanMovieResourceLinks.user.js
// @connect      thepiratebay.org
// @connect      dytt8899.com
// ==/UserScript==

(function () {
    'use strict';

    /** =========================
     * 样式：资源链接 icon（::before 方案）
     * ========================= */
    (function addResourceIconStyle() {
        const style = document.createElement('style');
        style.textContent = `
            /* ===== 容器 ===== */
            .tm-douban-resource__container {
                white-space: nowrap;
            }

            /* ===== 通用资源链接 ===== */
            .tm-douban-resource__link {
                position: relative;
                display: inline-flex;
                align-items: center;
                padding-left: 18px;      /* icon 占位 */
                line-height: 1.2;        /* 收紧 hover 背景高度 */
                vertical-align: middle;  /* 行内对齐更稳定 */
                text-decoration: none;
            }

            /* icon 通用规则 */
            .tm-douban-resource__link::before {
                content: "";
                position: absolute;
                left: 1px;               /* 稳定 1px 间距 */
                top: 50%;
                transform: translateY(-50%);
                width: 14px;
                height: 14px;
                background-repeat: no-repeat;
                background-size: contain;
                pointer-events: none;
            }

            /* ===== 海盗湾 ===== */
            .tm-douban-resource__link--hdw::before {
                background-image: url("https://thepiratebay.org/favicon.ico");
            }

            /* ===== 电影天堂 ===== */
            .tm-douban-resource__link--dytt::before {
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
        return title.replace(/\s*\(豆瓣\)\s*$/, '').trim();
    }

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

    function insertLinks() {
        const info = document.querySelector('#info');
        if (!info) return false;

        // 防重复
        if (info.querySelector('.tm-douban-resource__container')) return true;

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
        container.className = 'tm-douban-resource__container';
        container.innerHTML = `
            <span class="pl">磁力资源:</span>
            <a class="tm-douban-resource__link tm-douban-resource__link--hdw"
               href="https://thepiratebay.org/search.php?q=${imdbId}"
               target="_blank" rel="noopener noreferrer">
               海盗湾
            </a>
            &nbsp;/&nbsp;
            <a href="javascript:void(0);"
               class="tm-douban-resource__link tm-douban-resource__link--dytt tm-douban-resource__action-dytt">
               电影天堂
            </a>
        `;

        container
            .querySelector('.tm-douban-resource__action-dytt')
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
            if (insertLinks()) observer.disconnect();
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });

        setTimeout(() => {
            insertLinks();
            observer.disconnect();
        }, 3000);
    }

    waitForInfo();
})();
