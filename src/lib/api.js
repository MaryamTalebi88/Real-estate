/** Tiny fetch wrapper for the EstatePro API. */

export class ApiError extends Error {
  constructor(message, { status, errors } = {}) {
    super(message)
    this.status = status
    this.errors = errors || null
  }
}

async function request(path, { method = 'GET', body, headers = {}, raw = false } = {}) {
  const isForm = body instanceof FormData
  const res = await fetch(`/api${path}`, {
    method,
    credentials: 'same-origin',
    headers: isForm ? headers : { 'Content-Type': 'application/json', ...headers },
    body: isForm ? body : body !== undefined ? JSON.stringify(body) : undefined,
  })

  if (raw) return res

  let data = null
  const text = await res.text()
  if (text) {
    try {
      data = JSON.parse(text)
    } catch {
      data = null
    }
  }

  if (!res.ok) {
    throw new ApiError(data?.error || 'Request failed', {
      status: res.status,
      errors: data?.errors,
    })
  }
  return data
}

export const api = {
  get: (path, options) => request(path, { ...options }),
  post: (path, body, options) => request(path, { ...options, method: 'POST', body }),
  patch: (path, body, options) => request(path, { ...options, method: 'PATCH', body }),
  put: (path, body, options) => request(path, { ...options, method: 'PUT', body }),
  delete: (path, options) => request(path, { ...options, method: 'DELETE' }),
  upload: (files) => {
    const form = new FormData()
    for (const file of files) form.append('files', file)
    return request('/uploads', { method: 'POST', body: form })
  },
}

export function qs(params) {
  const search = new URLSearchParams()
  for (const [key, value] of Object.entries(params || {})) {
    if (value === undefined || value === null || value === '' || value === false) continue
    search.set(key, String(value))
  }
  const str = search.toString()
  return str ? `?${str}` : ''
}
