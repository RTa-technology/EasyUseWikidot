// function to format date
function formatDate(element) {
    let classNames = element.className.split(" ");

    // extract UNIX time from class
    let unixTime;
    for (let j = 0; j < classNames.length; j++) {
        if (classNames[j].startsWith("time_")) {
            unixTime = classNames[j].split("_")[1];
            break;
        }
    }

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
    // get all elements with class "odate"
    let odateElements = document.getElementsByClassName('odate');

    // iterate over each element
    for (let i = 0; i < odateElements.length; i++) {
        formatDate(odateElements[i]);
    }
}

// format all ".odate" elements at the start
formatAllDates();

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
                setTimeout(formatAllDates, 1000);
            }
        }
    });
});

if (target) {
    // configuration of the observer:
    // pass in the target node, as well as the observer options
    observer.observe(target, { attributes: true, attributeOldValue: true });
}


if (window.location.host.endsWith("wdfiles.com") && window.location.pathname.startsWith("/local--files")) {
    // create a new button element
    let btn = document.createElement("BUTTON");
    btn.innerHTML = "Go to Page";
    btn.id = "goToWikidot";

    // get the current URL
    let currentUrl = window.location.href;

    // generate the target URL
    let targetUrl = currentUrl.replace(/http:\/\/(.+?)\.wdfiles\.com\/local--files\//, "http://$1.wikidot.com/");

    btn.onclick = function () {
        window.location.href = targetUrl;
    };

    // add the button to the body
    document.body.appendChild(btn);
}

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


function addLinkToPosts() {
    // Get the thread ID from the global WIKIDOT object
    let threadId = getThreadIdFromScripts();

    // If we're not in a forum thread, just return
    if (typeof threadId === 'undefined') return;

    // Get all elements with class "post"
    let postElements = document.getElementsByClassName('post');

    // Iterate over each post element
    for (let i = 0; i < postElements.length; i++) {
        let postElement = postElements[i];

        // Extract the post ID from the element ID
        let postId = postElement.id.split('-')[1];

        // Generate the URL using the current hostname, thread and post IDs
        let url = `http://${window.location.hostname}/forum/t-${threadId}#post-${postId}`;

        // Find .long and .short elements
        let longElement = postElement.querySelector('.long .head');
        let shortElement = postElement.querySelector('.short');

        // Create new span elements with the link as its text content
        let longLinkElement = document.createElement('span');
        longLinkElement.textContent = url;
        longLinkElement.style.fontSize = '0.8em'; // Make it slightly smaller
        longLinkElement.style.color = '#888'; // Make it less prominent
        longLinkElement.style.display = 'block'; // Ensure it's on its own line

        let shortLinkElement = longLinkElement.cloneNode(true); // Create a copy for the short element

        // Add the new elements to .long and .short
        longElement.appendChild(longLinkElement);
        shortElement.appendChild(shortLinkElement);
    }
}

// Add links to posts at the start
addLinkToPosts();