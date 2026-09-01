// 找到用户复制的文字
function getCopiedText() {
  const active = document.activeElement;

  // 如果用户在输入框或文本框中复制，则返回选中的文字
  if (active instanceof HTMLInputElement || active instanceof HTMLTextAreaElement) {

    // 解构赋值，获取选中的文字的开始位置、结束位置和值
    const { selectionStart, selectionEnd, value } = active;

    // 如果选中的文字不为空，则返回选中的文字
    if (selectionStart != null && selectionEnd != null && selectionStart !== selectionEnd) {
      return value.slice(selectionStart, selectionEnd).trim(); 
    }

  }

  // 如果用户在其他地方复制，则返回选中的文字 
  return (document.getSelection()?.toString() || '').trim();
}

// 保存到本地，同时尝试同步到后端（失败不影响本地）
function saveToHistory(text) {
  const time = new Date().toLocaleString();

  chrome.storage.local.get({ history: [] }, (res) => {
    const history = [{ text, time }, ...res.history];
    chrome.storage.local.set({ history });
  });

  saveToApi(text, time);
}

// 保存到后端
function saveToApi(text, time) {
  fetch('http://127.0.0.1:8000/api/items', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, time }),
  }).catch(() => {});
}

// 处理复制事件
function handleCopy() {
  const text = getCopiedText();
  if (!text) return;
  saveToHistory(text);
}

// 给网页添加 事件监听器
document.addEventListener('copy', handleCopy, true);    // 监听copy
document.addEventListener('cut', handleCopy, true);    // 监听cut
