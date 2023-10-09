// function to extract UNIX time from class
function extractUnixTimeFromClassName(element) {
    let classNames = element.className.split(" ");

    for (let j = 0; j < classNames.length; j++) {
        if (classNames[j].startsWith("time_")) {
            return classNames[j].split("_")[1];
        }
    }

    return null;
}

// function to format date
function formatDate(element) {
    let unixTime = extractUnixTimeFromClassName(element);

    if (!unixTime) return;

    // convert UNIX time to Date object
    let dateObj = new Date(unixTime * 1000);

    // format date
    const formatter = new Intl.DateTimeFormat('ja-JP', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    });

    let dateFormatted = formatter.format(dateObj);

    // replace the text in the element
    element.innerText = dateFormatted;
}

// function to format all ".odate" elements
function formatAllDates() {
    let odateElements = document.getElementsByClassName('odate');

    // iterate over each element
    for (let i = 0; i < odateElements.length; i++) {
        formatDate(odateElements[i]);
    }
}

// function to extract post ID
function extractPostId(element) {
    return element.id.split('-')[1];
}

// function to create span element for url
function createSpanElementForUrl(url) {
    let linkElement = document.createElement('span');
    linkElement.textContent = url;
    linkElement.style.fontSize = '0.8em';
    linkElement.style.color = '#888';
    linkElement.style.display = 'block';

    return linkElement;
}

// function to get thread ID from scriptsh
function getThreadIdFromScripts() {
    // Get all script tags
    let scriptElements = document.getElementsByTagName('script');

    // Iterate over each script element
    for (let i = 0; i < scriptElements.length; i++) {
        let scriptContent = scriptElements[i].textContent;

        // Check if this script sets WIKIDOT.forumThreadId
        let match = scriptContent.match(/WIKIDOT\.forumThreadId\s*=\s*(\d+)/);
        if (match) {
            // Return the thread ID
            return match[1];
        }
    }

    // If no script sets WIKIDOT.forumThreadId, return null
    return null;
}

// function to add link to posts
function addLinkToPosts() {
    let threadId = getThreadIdFromScripts();

    if (!threadId) return;

    let postElements = document.getElementsByClassName('post');

    for (let i = 0; i < postElements.length; i++) {
        let postElement = postElements[i];

        let postId = extractPostId(postElement);
        let url = `http://${window.location.hostname}/forum/t-${threadId}#post-${postId}`;

        let longElement = postElement.querySelector('.long .head');
        let shortElement = postElement.querySelector('.short');

        // If link already exists in the element, remove it
        let existingLongLink = longElement.querySelector('span.linkSpan');
        let existingShortLink = shortElement.querySelector('span.linkSpan');
        if (existingLongLink) longElement.removeChild(existingLongLink);
        if (existingShortLink) shortElement.removeChild(existingShortLink);

        // Now create and add the new link
        let longLinkElement = createSpanElementForUrl(url);
        longLinkElement.className = "linkSpan";
        let shortLinkElement = longLinkElement.cloneNode(true);
        shortLinkElement.className = "linkSpan";

        longElement.appendChild(longLinkElement);
        shortElement.appendChild(shortLinkElement);
    }
}


function createGoToPageButton() {
    if (window.location.host.endsWith("wdfiles.com") && window.location.pathname.startsWith("/local--files")) {
        let btn = document.createElement("BUTTON");
        btn.innerHTML = "Go to Page";
        btn.id = "goToWikidot";

        let currentUrl = window.location.href;
        let targetUrl = currentUrl.replace(/http:\/\/(.+?)\.wdfiles\.com\/local--files\//, "http://$1.wikidot.com/");

        btn.onclick = function () {
            window.location.href = targetUrl;
        };

        document.body.appendChild(btn);
    }
}

const pagesourcetargetvalue = `
> `;

// 要素の変更を監視して更新する関数
function checkAndUpdateTextContent(element) {
    // もしelementがテキストノードで、内容が '> ' の場合
    if (element.nodeType === Node.TEXT_NODE && element.nodeValue === pagesourcetargetvalue) {
        element.parentNode.innerHTML = element.parentNode.innerHTML.replace(/\&gt; /g, '&gt;&nbsp;');
        return;
    }

    // elementがテキストノードでない場合、その子要素を再帰的に探索
    for (let child of element.childNodes) {
        checkAndUpdateTextContent(child);
    }
}


// Observerのコールバック関数
function callbackForPageSource(mutationsList, observer) {
    for (let mutation of mutationsList) {
        if (mutation.type === 'childList') {
            mutation.addedNodes.forEach(node => {
                // 対象の要素であるかを確認
                if (node.matches && node.matches("#action-area > div.page-source")) {
                    checkAndUpdateTextContent(node);
                }
            });
        }
    }
}




// target element to observe
let target = document.getElementById('html-body');

// create an observer instance
let observer = new MutationObserver(function (mutations) {
    mutations.forEach(function (mutation) {
        if (mutation.attributeName === "class") {
            let oldClassList = mutation.oldValue ? mutation.oldValue.split(' ') : [];
            let newClassList = mutation.target.className.split(' ');

            if (oldClassList.includes("wait") && !newClassList.includes("wait")) {
                // delay the processing by 1 second to wait for DOM updates
                setTimeout(() => {
                    formatAllDates();
                    addLinkToPosts();
                }, 50);
            }
        }
    });
});


if (target) {
    observer.observe(target, { attributes: true, attributeOldValue: true });
}

// Observerのインスタンスを作成
const observerForPageSource = new MutationObserver(callbackForPageSource);

// #action-area要素を監視する設定
let actionArea = document.querySelector("#action-area");
if (actionArea) {
    observerForPageSource.observe(actionArea, {
        childList: true,
        subtree: true
    });
}

// format all ".odate" elements at the start
formatAllDates();

// Add links to posts at the start
addLinkToPosts();

// create "Go to Page" button at the start
createGoToPageButton();