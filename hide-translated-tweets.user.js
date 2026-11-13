// ==UserScript==
// @name         Hide Translated Tweets
// @namespace    https://github.com/davidstehle
// @version      1.0.0
// @description  Hides non-English tweets in the For You tab
// @match        https://twitter.com/*
// @match        https://x.com/*
// @grant        none
// ==/UserScript==

(() => {
    'use strict';

    const HIDDEN = 'data-x-filter-hidden';
    const STYLE_ID = 'x-filter-hide-style';
    const TWEETS = 'article[data-testid="tweet"]';
    const TWEET_TEXT = '[data-testid="tweetText"]';

    if (!document.getElementById(STYLE_ID)) {
        const style = document.createElement('style');
        style.id = STYLE_ID;
        style.textContent = `article[${HIDDEN}="yes"]{display:none!important}`;
        (document.head || document.documentElement).appendChild(style);
    }

    const isForYou = () =>
        location.pathname === '/home' &&
        /^for you$/i.test(
            document.querySelector('[role="tab"][aria-selected="true"]')?.textContent.trim() || ''
        );

    const inspect = article => {
        const lang = article.querySelector(TWEET_TEXT)?.getAttribute('lang') || '';

        if (/translated\s+from/i.test(article.textContent || '') ||
            !/^en(?:-|$)/i.test(lang.trim())) {
            article.setAttribute(HIDDEN, 'yes');
        }
    };

    const scan = () => {
        if (isForYou()) document.querySelectorAll(TWEETS).forEach(inspect);
    };

    let scheduled = false;

    const observer = new MutationObserver(() => {
        if (scheduled) return;
        scheduled = true;

        requestAnimationFrame(() => {
            scheduled = false;
            scan();
        });
    });

    const start = () => {
        if (!document.body) return requestAnimationFrame(start);

        observer.observe(document.body, {
            childList: true,
            subtree: true,
            characterData: true
        });

        scan();
        console.info('[X English Originals Only] Running');
    };

    start();
})();