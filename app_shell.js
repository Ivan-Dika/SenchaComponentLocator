const sandbox = document.getElementById('sandbox');

let activeComponentLocatorData = null;

if (chrome.devtools) {
    chrome.devtools.panels.elements.onSelectionChanged.addListener(getElementData);
    getElementData();
}

function getElementData() {
    chrome.devtools.inspectedWindow.eval("new (" + ComponentLocator.toString() + ")($0)", processElementData);
}

function processElementData(result) {
    activeComponentLocatorData = result;

    if (sandbox.contentWindow) {
        sandbox.contentWindow.postMessage({
            type: 'elementData',
            data: result
        }, '*');
    }
}

window.addEventListener('message', function(event) {
    if (event.data && event.data.type === 'sandboxReady') {
        if (activeComponentLocatorData) {
            sandbox.contentWindow.postMessage({
                type: 'elementData',
                data: activeComponentLocatorData
            }, '*');
        }

        syncTheme();
    }
});

if (chrome.devtools && chrome.devtools.panels && chrome.devtools.panels.onThemeChanged) {
    chrome.devtools.panels.onThemeChanged.addListener(syncTheme);
}

function syncTheme() {
    if (chrome.devtools && chrome.devtools.panels) {
        var devtoolsTheme = chrome.devtools.panels.themeName;
        var theme = devtoolsTheme === 'dark' ? 'dark' : 'light';
        
        sandbox.contentWindow.postMessage({
            type: 'setTheme',
            value: theme
        }, '*');
    }
}
