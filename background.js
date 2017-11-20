var currentTab;
var currentBookmark;
var repoList = [];

/*
 * Updates the browserAction icon to reflect whether the current page
 * is already bookmarked.
 */
function updateIcon() {
  browser.browserAction.setIcon({
    path: currentBookmark ? {
      19: "icons/19.png",
      38: "icons/38.png"
    } : {
      19: "icons/19-bizaro.png",
      38: "icons/38-bizaro.png"
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
  let cloneStr = ['githoard://openRepo', currentURL.origin, owner, name].join('/');
  let repoUrl = new URL(cloneStr);

  console.log('githoard tab', currentTab);
  console.log('githoard url', currentURL);
  console.log('githoard parse', owner, name, repoUrl);

  if (testUrl(currentURL)) {
    var creating = browser.tabs.create({
      url: cloneStr,
      active: false
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
}

browser.browserAction.onClicked.addListener(toggleBookmark);

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
      console.log('updateTab repoList', repoList.includes(currentTab.url), currentTab.url);

      currentBookmark = repoList.includes(currentTab.url);
      updateIcon();
    }
  }

  var gettingActiveTab = browser.tabs.query({active: true, currentWindow: true});
  gettingActiveTab.then(updateTab);
}

// listen to tab URL changes
browser.tabs.onUpdated.addListener(updateActiveTab);

// listen to tab switching
browser.tabs.onActivated.addListener(updateActiveTab);

// listen for window switching
browser.windows.onFocusChanged.addListener(updateActiveTab);

function hasGitRepo(message) {
  console.log('hasGitRepo msg', message);
  if (message.matches !== null) {
    repoList.push(message.url);
    updateActiveTab();
  }
  // browser.notifications.create({
  //   "type": "basic",
  //   "iconUrl": browser.extension.getURL("link.png"),
  //   "title": "You clicked a link!",
  //   "message": message.url
  // });
}

browser.runtime.onMessage.addListener(hasGitRepo);

// update when the extension loads initially
updateActiveTab();
