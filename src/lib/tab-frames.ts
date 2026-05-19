export async function getActiveTabId() {
  const tabs = await queryTabs({ active: true, currentWindow: true })
  return tabs[0]?.id
}

function queryTabs(queryInfo: chrome.tabs.QueryInfo) {
  return new Promise<chrome.tabs.Tab[]>((resolve) => {
    chrome.tabs.query(queryInfo, resolve)
  })
}
