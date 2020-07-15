<div align="center">
<img width="150" src="https://raw.githubusercontent.com/beepboopbangbang/githoard/master/src/renderer/assets/icon.png" alt="GitHoard" />
</div>

<h3 align="center">
GitHoard - Quick Clone
</h3>

<p align="center">
Hoard git repositories with even more ease
</p>

## What it does

Displays a simple button in the menu bar that detects Git repository links in web sites and quickly clones the repository when clicked.

To display the button, the extension registers a [browserAction](https://developer.mozilla.org/en-US/Add-ons/WebExtensions/API/browserAction) in the manifest.

A background script will listen for tab events and update the browserAction icon correspondingly.
