// 该文件用于封装前端与后端的交互逻辑，提供一个统一的API接口调用方式，方便在组件中使用。

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000'

export async function analyzeJD(jdContent, resumeId) {
  // 发送请求到后端分析接口
  const res = await fetch(`${API_BASE_URL}/api/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      text: jdContent,
      url: '',
      resume_id: resumeId || null,
    }),
  })


  // 错误处理：如果后端返回非200状态码，尝试解析错误信息并抛出异常
  if (!res.ok) {
    const error = await res.json().catch(() => ({}))
    throw new Error(error.detail || `分析服务错误: ${res.status} ${res.statusText}`)
  }

  return res.json()
}

// 分析单条复制记录
export async function analyzeItem(itemId, resumeId) {
  const query = resumeId ? `?resume_id=${resumeId}` : ''
  const res = await fetch(`${API_BASE_URL}/api/items/${itemId}/analyze${query}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  })

  if (!res.ok) {
    const error = await res.json().catch(() => ({}))
    throw new Error(error.detail || `分析服务错误: ${res.status} ${res.statusText}`)
  }

  return res.json()
}

export async function getLatestResume() {
  const res = await fetch(`${API_BASE_URL}/api/resumes/latest`)

  if (!res.ok) {
    const error = await res.json().catch(() => ({}))
    throw new Error(error.detail || `简历读取失败: ${res.status} ${res.statusText}`)
  }

  return res.json()
}

export async function saveResume(name, content) {
  const res = await fetch(`${API_BASE_URL}/api/resumes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, content }),
  })

  if (!res.ok) {
    const error = await res.json().catch(() => ({}))
    throw new Error(error.detail || `简历保存失败: ${res.status} ${res.statusText}`)
  }

  return res.json()
}
