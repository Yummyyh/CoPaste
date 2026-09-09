// 控制点击插件图标后看到的页面：优先显示 MySQL，接口失败再读本地
const historyList = document.getElementById('history-list');
const searchInput = document.getElementById('search-input');
const tagButtons = document.querySelectorAll('.tag-bar button');
const analyzeSelectedButton = document.getElementById('analyze-selected');
const selectionHint = document.getElementById('selection-hint');
const TAGS = [ 'JD', '未分类'];
const JD_INSIGHT_URL = 'http://localhost:5173/';

let currentTag = '';
let selectedItemId = null;

function updateSelectionState() {
  const hasSelection = selectedItemId !== null;
  analyzeSelectedButton.disabled = !hasSelection;
  selectionHint.textContent = hasSelection ? '已选择 1 条 JD' : '请选择一条 JD';
}

// 渲染历史记录
function renderHistory(history) {
  historyList.textContent = '';
  selectedItemId = null;
  updateSelectionState();

  if (history.length === 0) {
    const li = document.createElement('li');
    li.textContent = '暂无复制记录';
    historyList.appendChild(li);
    return;
  }

  // 遍历历史记录，创建列表项
  history.forEach(({ id, text, time, tag }) => {
    const li = document.createElement('li');

    const select = document.createElement('select');
    select.className = 'item-tag';
    TAGS.forEach((name) => {
      const option = document.createElement('option');
      option.value = name;
      option.textContent = name;
      select.appendChild(option);
    });
    select.value = TAGS.includes(tag) ? tag : '未分类';

    // 绑定 change 事件：当用户选择不同的标签时，调用 updateTag 更新标签
    if (id != null) {
      select.addEventListener('change', () => updateTag(id, select.value));
    }

    const timeEl = document.createElement('span');
    timeEl.className = 'item-time';
    timeEl.textContent = time;

    const contentEl = document.createElement('div');
    contentEl.className = 'item-content';
    contentEl.textContent = text;

    const rowHeader = document.createElement('div');
    rowHeader.className = 'item-header';

    if (id != null && tag === 'JD') {
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.className = 'item-checkbox';
      checkbox.setAttribute('aria-label', '选择这条 JD');
      checkbox.addEventListener('change', () => {
        selectedItemId = checkbox.checked ? id : null;
        updateSelectionState();
      });
      rowHeader.appendChild(checkbox);
    }

    rowHeader.append(select, timeEl);
    li.append(rowHeader, contentEl);
    historyList.appendChild(li);
  });
}

function analyzeSelectedItem() {
  if (selectedItemId === null) return;

  const url = new URL(JD_INSIGHT_URL);
  url.searchParams.set('itemId', selectedItemId);
  chrome.tabs.create({ url: url.toString() });
}

function updateTag(id, tag) {
  fetch('http://127.0.0.1:8000/api/items/' + id, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tag }),
  })
    .then((res) => {
      if (!res.ok) throw new Error('api failed');
    })
    .then(() => loadHistory())
    .catch(() => loadHistory());
}

function filterLocal(history) {
  const q = searchInput.value.trim();
  return history.filter((item) => {
    const tag = item.tag || '未分类';
    const matchTag = !currentTag || tag === currentTag;
    const matchText = !q || (item.text || '').includes(q);
    return matchTag && matchText;
  });
}

function loadFromLocal() {
  chrome.storage.local.get({ history: [] }, (result) => {
    renderHistory(filterLocal(result.history));
  });
}

function loadHistory() {
  const params = new URLSearchParams();
  const q = searchInput.value.trim();
  if (q) params.set('q', q);
  if (currentTag) params.set('tag', currentTag);

  const url = 'http://127.0.0.1:8000/api/items' + (params.toString() ? '?' + params : '');

  fetch(url)
    .then((res) => {
      if (!res.ok) throw new Error('api failed');
      return res.json();
    })
    .then((items) => renderHistory(items))
    .catch(() => loadFromLocal());
}

searchInput.addEventListener('input', loadHistory);
analyzeSelectedButton.addEventListener('click', analyzeSelectedItem);

tagButtons.forEach((button) => {
  button.addEventListener('click', () => {
    currentTag = button.dataset.tag || '';
    tagButtons.forEach((btn) => btn.classList.toggle('active', btn === button));
    loadHistory();
  });
});

loadHistory();

chrome.storage.onChanged.addListener((changes) => {
  if (changes.history) {
    loadHistory();
  }
});
