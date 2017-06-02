var currentTab;
var currentBookmark;

/*
 * Updates the browserAction icon to reflect whether the current page
 * is already bookmarked.
 */
function updateIcon() {
  browser.browserAction.setIcon({
    path: currentBookmark ? {
      19: "icons/star-filled-19.png",
      38: "icons/star-filled-38.png"
    } : {
      19: "icons/star-empty-19.png",
      38: "icons/star-empty-38.png"
    },
    tabId: currentTab.id
  });
}

function testUrl(url) {
  let ghd = 'github.com';
  if (url.host.endsWith(ghd)) {
    return true;
  }
  return false;
}

function name(str) {
  return str ? str.replace(/^\W+|\.git$/g, '') : null;
}

function owner(str) {
  if (!str) return null;
  var idx = str.indexOf(':');
  if (idx > -1) {
    return str.slice(idx + 1);
  }
  return str;
}

/*
 * Add or remove the bookmark on the current page.
 */
function toggleBookmark() {
  let currentId = currentTab.id;
  let currentURL = new URL(currentTab.url);
  let seg = currentURL.pathname.split('/').filter(Boolean);
  let owner = seg[0];
  let name = seg[1];
  // github-mac://openRepo/https://github.com/jgallagher/rusqlite
  let cloneStr = ['github-windows://openRepo', currentURL.origin, owner, name].join('/');
  let repoUrl = new URL(cloneStr);

  console.log('githoard tab', currentTab);
  console.log('githoard url', currentURL);
  console.log('githoard parse', owner, name, repoUrl);

  if (testUrl(currentURL)) {
    var creating = browser.tabs.create({
      url: cloneStr
    });
    creating.then((tab) => {
      var removing = browser.tabs.remove(tab.id);
      removing.then((tab) => {
        var updating = browser.tabs.update(currentId, {
          active: true
        });
      });
    });
  }
  // js-zeroclipboard-target
  // if (currentBookmark) {
  //   browser.bookmarks.remove(currentBookmark.id);
  // } else {
  //   browser.bookmarks.create({title: currentTab.title, url: currentTab.url});
  // }
}

browser.browserAction.onClicked.addListener(toggleBookmark);

/*
 * Switches currentTab and currentBookmark to reflect the currently active tab
 */
function updateActiveTab(tabs) {

  function isSupportedProtocol(urlString) {
    var supportedProtocols = ["https:", "http:", "ftp:", "file:"];
    var url = document.createElement('a');
    url.href = urlString;
    return supportedProtocols.indexOf(url.protocol) != -1;
  }

  function updateTab(tabs) {
    if (tabs[0]) {
      currentTab = tabs[0];
      if (isSupportedProtocol(currentTab.url)) {
        var searching = browser.bookmarks.search({url: currentTab.url});
        searching.then((bookmarks) => {
          currentBookmark = bookmarks[0];
          updateIcon();
        });
      } else {
        console.log(`Bookmark it! does not support the '${currentTab.url}' URL.`)
      }
    }
  }

  var gettingActiveTab = browser.tabs.query({active: true, currentWindow: true});
  gettingActiveTab.then(updateTab);
}

// listen for bookmarks being created
browser.bookmarks.onCreated.addListener(updateActiveTab);

// listen for bookmarks being removed
browser.bookmarks.onRemoved.addListener(updateActiveTab);

// listen to tab URL changes
browser.tabs.onUpdated.addListener(updateActiveTab);

// listen to tab switching
browser.tabs.onActivated.addListener(updateActiveTab);

// listen for window switching
browser.windows.onFocusChanged.addListener(updateActiveTab);

// update when the extension loads initially
updateActiveTab();
