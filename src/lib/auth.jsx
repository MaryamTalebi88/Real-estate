import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from './api.js'
import { useI18n } from './i18n.jsx'
import { useToast } from './toast.jsx'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [favoriteIds, setFavoriteIds] = useState([])
  const { pick } = useI18n()
  const toast = useToast()
  const navigate = useNavigate()

  const loadFavorites = useCallback(async () => {
    try {
      const ids = await api.get('/me/favorite-ids')
      setFavoriteIds(ids)
    } catch {
      setFavoriteIds([])
    }
  }, [])

  const refresh = useCallback(async () => {
    try {
      const data = await api.get('/auth/me')
      setUser(data.user)
      if (data.user) await loadFavorites()
      else setFavoriteIds([])
      return data.user
    } catch {
      setUser(null)
      return null
    }
  }, [loadFavorites])

  useEffect(() => {
    refresh().finally(() => setLoading(false))
  }, [refresh])

  const login = useCallback(
    async (email, password) => {
      const data = await api.post('/auth/login', { email, password })
      setUser(data.user)
      await loadFavorites()
      return data.user
    },
    [loadFavorites],
  )

  const register = useCallback(
    async (payload) => {
      const data = await api.post('/auth/register', payload)
      setUser(data.user)
      setFavoriteIds([])
      return data.user
    },
    [],
  )

  const logout = useCallback(async () => {
    await api.post('/auth/logout')
    setUser(null)
    setFavoriteIds([])
    navigate('/')
  }, [navigate])

  const updateProfile = useCallback(async (payload) => {
    const data = await api.patch('/auth/profile', payload)
    setUser((prev) => ({ ...prev, ...data.user }))
    return data.user
  }, [])

  const toggleFavorite = useCallback(
    async (propertyId) => {
      if (!user) {
        toast.push(
          pick('Sign in to save properties to your favorites.', 'برای ذخیره ملک در علاقه‌مندی‌ها وارد شوید.'),
          'error',
        )
        navigate('/login')
        return false
      }
      const isFav = favoriteIds.includes(propertyId)
      setFavoriteIds((prev) =>
        isFav ? prev.filter((id) => id !== propertyId) : [...prev, propertyId],
      )
      try {
        if (isFav) await api.delete(`/favorites/${propertyId}`)
        else await api.post(`/favorites/${propertyId}`)
        return !isFav
      } catch {
        setFavoriteIds((prev) =>
          isFav ? [...prev, propertyId] : prev.filter((id) => id !== propertyId),
        )
        toast.error(pick('Could not update favorites.', 'به‌روزرسانی علاقه‌مندی‌ها ممکن نشد.'))
        return isFav
      }
    },
    [user, favoriteIds, navigate, pick, toast],
  )

  const value = useMemo(
    () => ({
      user,
      loading,
      isAdmin: user?.role === 'admin',
      isAgent: user?.role === 'agent',
      favoriteIds,
      login,
      register,
      logout,
      refresh,
      updateProfile,
      toggleFavorite,
      setUser,
      reloadFavorites: loadFavorites,
    }),
    [user, loading, favoriteIds, login, register, logout, refresh, updateProfile, toggleFavorite, loadFavorites],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
