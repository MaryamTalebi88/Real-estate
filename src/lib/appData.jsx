import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { api } from './api.js'

const AppDataContext = createContext(null)

const EMPTY = {
  settings: { siteName: 'EstatePro', stats: [], sections: {}, faq: [], contact: {}, social: {} },
  categories: [],
  cities: [],
  neighborhoods: [],
  amenities: [],
  counts: {},
}

export function AppDataProvider({ children }) {
  const [data, setData] = useState(EMPTY)
  const [loading, setLoading] = useState(true)

  const reload = useCallback(async () => {
    try {
      const next = await api.get('/bootstrap')
      setData({ ...EMPTY, ...next })
      return next
    } catch {
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    reload()
  }, [reload])

  const value = useMemo(() => ({ ...data, loading, reload }), [data, loading, reload])
  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>
}

export function useAppData() {
  const ctx = useContext(AppDataContext)
  if (!ctx) throw new Error('useAppData must be used inside AppDataProvider')
  return ctx
}
