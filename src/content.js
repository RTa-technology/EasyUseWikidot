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

// pass in the target node, as well as the observer options
observer.observe(target, { attributes: true, attributeOldValue: true });
