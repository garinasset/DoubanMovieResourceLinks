// ==UserScript==
// @name         Douban Movie Resource Links
// @name:zh-CN   豆瓣电影资源链接
// @namespace    https://github.com/garinasset/DoubanMovieResourceLinks
// @version      2.0.2
// @description  在豆瓣电影页面中自动添加第三方资源搜索链接
// @author       garinasset
// @homepageURL  https://github.com/garinasset/DoubanMovieResourceLinks
// @supportURL   https://github.com/garinasset/DoubanMovieResourceLinks/issues
// @updateURL    https://raw.githubusercontent.com/garinasset/DoubanMovieResourceLinks/main/DoubanMovieResourceLinks.user.js
// @downloadURL  https://raw.githubusercontent.com/garinasset/DoubanMovieResourceLinks/main/DoubanMovieResourceLinks.user.js
// @match        https://movie.douban.com/subject/*
// @run-at       document-end
// @grant        none
// @connect      thepiratebay.org
// @connect      dytt8899.com
// ==/UserScript==

(function () {
    'use strict';

    /** =========================
     * 样式：资源链接 icon（::before 方案）
     * ========================= */
    (function addResourceIconStyle() {
        console.log("Adding resource icon styles...");
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
        console.log("Resource icon styles added.");
    })();

    /** =========================
     * 工具函数
     * ========================= */

    function getCleanChineseTitle() {
        console.log("Extracting Chinese title...");
        const title = document.title || '';
        const cleanedTitle = title.replace(/\s*\(豆瓣\)\s*$/, '').trim();
        console.log("Cleaned Chinese title:", cleanedTitle);
        return cleanedTitle;
    }

    function openDyttSearch(keyword) {
        console.log("Opening search for:", keyword);
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
        console.log("Search form submitted for:", keyword);
    }

    function insertLinks() {
        console.log("Checking for IMDb ID...");
        const info = document.querySelector('#info');
        if (!info) {
            console.log("Info element not found.");
            return false;
        }

        // 防重复
        if (info.querySelector('.tm-douban-resource__container')) {
            console.log("Links already inserted, skipping.");
            return true;
        }

        /** ===== IMDb ===== */
        const imdbLabel = Array.from(info.querySelectorAll('span.pl'))
            .find(span => span.textContent.trim() === 'IMDb:');

        if (!imdbLabel) {
            console.log("IMDb label not found.");
            return false;
        }

        const imdbTextNode = imdbLabel.nextSibling;
        if (!imdbTextNode || imdbTextNode.nodeType !== Node.TEXT_NODE) {
            console.log("IMDb ID is not a text node.");
            return false;
        }

        const imdbId = imdbTextNode.textContent.trim();
        console.log("Found IMDb ID:", imdbId);

        if (!/^tt\d+$/.test(imdbId)) {
            console.log("Invalid IMDb ID:", imdbId);
            return false;
        }

        /** ===== 中文名 ===== */
        const cnTitle = getCleanChineseTitle();
        if (!cnTitle) {
            console.log("Chinese title is empty.");
            return false;
        }

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

        console.log("Resource links inserted.");
        return true;
    }

    /** =========================
     * 等待 DOM（豆瓣 SPA）
     * ========================= */

    function waitForInfo() {
        console.log("Waiting for DOM to load...");
        if (insertLinks()) return;

        const observer = new MutationObserver(() => {
            console.log("Mutation detected.");
            if (insertLinks()) observer.disconnect();
        });

        // Monitoring the body subtree for any changes
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



