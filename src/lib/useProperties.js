import { useEffect, useState } from 'react'
import { api, qs } from './api.js'

/** Fetches a filtered property list. */
export function useProperties(params, { limit = 6 } = {}) {
  const [state, setState] = useState({ items: [], total: 0, loading: true, error: null })
  const key = JSON.stringify(params)

  useEffect(() => {
    let active = true
    setState((prev) => ({ ...prev, loading: true, error: null }))
    api
      .get(`/properties${qs({ ...JSON.parse(key), limit })}`)
      .then((data) => {
        if (!active) return
        setState({ items: data.items, total: data.total, loading: false, error: null })
      })
      .catch((error) => {
        if (active) setState({ items: [], total: 0, loading: false, error })
      })
    return () => {
      active = false
    }
  }, [key, limit])

  return state
}
