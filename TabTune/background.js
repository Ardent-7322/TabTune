let isEnabled = false;

function isWhitelisted(url, whitelist) {
  return whitelist.some((site) => url.includes(site));
}

function handleTabSwitch(activeTabId) {
  if (!isEnabled) return;

  chrome.storage.local.get("whitelist", (data) => {
    const whitelist = data.whitelist || [];

    chrome.tabs.query({}, (tabs) => {
      tabs.forEach((tab) => {
        if (tab.id === activeTabId) {
          if (!isWhitelisted(tab.url, whitelist)) {
            chrome.tabs.sendMessage(tab.id, { action: "playAndUnmute" });
          }
        } else {
          if (!isWhitelisted(tab.url, whitelist)) {
            chrome.tabs.sendMessage(tab.id, { action: "pauseAndMute" });
          }
        }
      });
    });
  });
}

chrome.tabs.onActivated.addListener((activeInfo) => {
  if (isEnabled) {
    handleTabSwitch(activeInfo.tabId);
  }
});

chrome.windows.onFocusChanged.addListener((windowId) => {
  if (windowId !== chrome.windows.WINDOW_ID_NONE && isEnabled) {
    chrome.tabs.query({ active: true, windowId: windowId }, (tabs) => {
      if (tabs.length > 0) {
        handleTabSwitch(tabs[0].id);
      }
    });
  }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.action) {
    case "toggleEnable":
      isEnabled = request.value;
      if (isEnabled) {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          if (tabs.length > 0) {
            handleTabSwitch(tabs[0].id);
          }
        });
      }
      updateBadge();
      sendResponse({ isEnabled: isEnabled });
      break;
    case "getStatus":
      sendResponse({ isEnabled: isEnabled });
      break;
    case "addToWhitelist":
      addToWhitelist(request.url, sendResponse);
      break;
    case "getWhitelist":
      getWhitelist(sendResponse);
      break;
    case "removeFromWhitelist":
      removeFromWhitelist(request.url, sendResponse);
      break;
  }
  return true; // Indicates that the response is sent asynchronously
});

function addToWhitelist(url, callback) {
  chrome.storage.local.get("whitelist", (data) => {
    const whitelist = data.whitelist || [];
    if (!whitelist.includes(url)) {
      whitelist.push(url);
      chrome.storage.local.set({ whitelist: whitelist }, callback);
    } else {
      callback();
    }
  });
}

function getWhitelist(callback) {
  chrome.storage.local.get("whitelist", (data) => {
    callback({ whitelist: data.whitelist || [] });
  });
}

function removeFromWhitelist(url, callback) {
  chrome.storage.local.get("whitelist", (data) => {
    const whitelist = data.whitelist || [];
    const index = whitelist.indexOf(url);
    if (index > -1) {
      whitelist.splice(index, 1);
      chrome.storage.local.set({ whitelist: whitelist }, callback);
    } else {
      callback();
    }
  });
}

function updateBadge() {
  chrome.action.setBadgeText({ text: isEnabled ? "ON" : "OFF" });
  chrome.action.setBadgeBackgroundColor({
    color: isEnabled ? "#4CAF50" : "#F44336",
  });
}

// Set initial badge
updateBadge();

// Initialize extension state
chrome.runtime.onInstalled.addListener(() => {
  updateBadge();
});
