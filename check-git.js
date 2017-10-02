
function checkCode() {
    // let currentURL = new URL(currentTab.url);
    var checkForGitURL = /"((git|ssh|http(s)?)|(git@[\w\.]+))(:(\/\/)?)([\w\.@\:/\-~]+)(\.git)(\/)?"/gi;
    var gitCheck = document.documentElement.innerHTML.match(checkForGitURL);
    console.log('gitCheck', location, gitCheck, JSON.stringify(gitCheck));
    browser.runtime.sendMessage({ "url": location.href, "matches": gitCheck });
}

checkCode();