chrome.runtime.onStartup.addListener(
  () => console.log('onStartup')
)

chrome.runtime.openOptionsPage()