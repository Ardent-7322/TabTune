document.addEventListener('DOMContentLoaded', function() {
    const toggleButton = document.getElementById('toggleButton');
    const addToWhitelistButton = document.getElementById('addToWhitelistButton');
    const urlInput = document.getElementById('urlInput');
    const statusIndicator = document.getElementById('statusIndicator');
    const whitelistItems = document.getElementById('whitelistItems');

    function updateUI(isEnabled) {
        toggleButton.textContent = isEnabled ? "Disable TabTune" : "Enable TabTune";
        toggleButton.style.backgroundColor = isEnabled ? "#e74c3c" : "#2ecc71";
        toggleButton.style.color = "white";
        statusIndicator.textContent = isEnabled ? "TabTune is ON" : "TabTune is OFF";
        statusIndicator.style.backgroundColor = isEnabled ? "#2ecc71" : "#e74c3c";
        statusIndicator.style.color = "white";
    }

    function updateWhitelist() {
        chrome.runtime.sendMessage({action: "getWhitelist"}, function(response) {
            whitelistItems.innerHTML = '';
            response.whitelist.forEach(url => {
                const item = document.createElement('div');
                item.className = 'whitelistItem';
                item.innerHTML = `
                    <span>${url}</span>
                    <button class="removeButton" data-url="${url}">Remove</button>
                `;
                whitelistItems.appendChild(item);
            });

            // Add event listeners to remove buttons
            document.querySelectorAll('.removeButton').forEach(button => {
                button.addEventListener('click', function() {
                    const url = this.getAttribute('data-url');
                    chrome.runtime.sendMessage({action: "removeFromWhitelist", url: url}, function() {
                        updateWhitelist();
                    });
                });
            });
        });
    }

    // Get initial status and whitelist
    chrome.runtime.sendMessage({action: "getStatus"}, function(response) {
        updateUI(response.isEnabled);
    });
    updateWhitelist();

    toggleButton.addEventListener('click', function() {
        chrome.runtime.sendMessage({action: "getStatus"}, function(response) {
            const newState = !response.isEnabled;
            chrome.runtime.sendMessage({action: "toggleEnable", value: newState}, function(toggleResponse) {
                updateUI(toggleResponse.isEnabled);
            });
        });
    });

    addToWhitelistButton.addEventListener('click', function() {
        const url = urlInput.value.trim();
        if (url) {
            chrome.runtime.sendMessage({action: "addToWhitelist", url: url}, function() {
                urlInput.value = '';
                updateWhitelist();
            });
        }
    });
});