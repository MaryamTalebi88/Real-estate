import { useEffect, useState } from 'react'
import { Search, Trash2 } from 'lucide-react'
import { api } from '../../lib/api.js'
import { useI18n } from '../../lib/i18n.jsx'
import { formatDate } from '../../lib/format.js'
import { useToast } from '../../lib/toast.jsx'
import { useAuth } from '../../lib/auth.jsx'
import usePageMeta from '../../lib/useMeta.js'

export default function AdminUsers() {
  const { t, pick } = useI18n()
  const { user: me } = useAuth()
  const toast = useToast()
  const [users, setUsers] = useState([])
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(true)

  usePageMeta({ title: `${t('admin.users')} — EstatePro` })

  const load = (q = '') =>
    api
      .get(`/admin/users${q ? `?q=${encodeURIComponent(q)}` : ''}`)
      .then(setUsers)
      .catch(() => setUsers([]))
      .finally(() => setLoading(false))

  useEffect(() => {
    load()
  }, [])

  const patch = async (target, body) => {
    try {
      await api.patch(`/admin/users/${target.id}`, body)
      setUsers((prev) => prev.map((u) => (u.id === target.id ? { ...u, ...body } : u)))
      toast.success(t('admin.savedOk'))
    } catch (err) {
      toast.error(err.message || t('common.error'))
    }
  }

  const remove = async (target) => {
    if (!window.confirm(pick('Delete this user?', 'این کاربر حذف شود؟'))) return
    try {
      await api.delete(`/admin/users/${target.id}`)
      setUsers((prev) => prev.filter((u) => u.id !== target.id))
      toast.success(t('admin.savedOk'))
    } catch (err) {
      toast.error(err.message || t('common.error'))
    }
  }

  return (
    <>
      <form
        className="row gap-10"
        style={{ marginBlockEnd: 18 }}
        onSubmit={(e) => {
          e.preventDefault()
          setLoading(true)
          load(query)
        }}
      >
        <input
          className="input"
          style={{ maxWidth: 320 }}
          placeholder={pick('Search name or email…', 'جستجوی نام یا ایمیل…')}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button type="submit" className="btn btn-navy btn-sm">
          <Search size={15} /> {t('common.search')}
        </button>
      </form>

      {loading ? (
        <div className="skeleton" style={{ height: 220, borderRadius: 20 }} />
      ) : (
        <div className="table-wrap">
          <div className="table-scroll">
            <table className="data">
              <thead>
                <tr>
                  <th>{t('common.name')}</th>
                  <th>{t('common.email')}</th>
                  <th>{t('admin.role')}</th>
                  <th>{t('common.status')}</th>
                  <th>{pick('Listings', 'آگهی')}</th>
                  <th>{t('common.date')}</th>
                  <th style={{ textAlign: 'end' }}>{t('common.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {users.map((item) => (
                  <tr key={item.id}>
                    <td className="row-title">{item.name}</td>
                    <td className="small">{item.email}</td>
                    <td>
                      <select
                        className="select"
                        style={{ minWidth: 120, padding: '7px 12px' }}
                        value={item.role}
                        onChange={(e) => patch(item, { role: e.target.value })}
                        disabled={item.id === me?.id}
                      >
                        <option value="user">user</option>
                        <option value="agent">agent</option>
                        <option value="admin">admin</option>
                      </select>
                    </td>
                    <td>
                      <span className={`badge ${item.status === 'active' ? 'badge-success' : 'badge-danger'}`}>
                        {item.status}
                      </span>
                    </td>
                    <td>{item.listings}</td>
                    <td className="small muted nowrap">{formatDate(item.created_at)}</td>
                    <td>
                      <div className="table-actions">
                        <button
                          type="button"
                          className="mini-btn"
                          onClick={() => patch(item, { status: item.status === 'active' ? 'suspended' : 'active' })}
                        >
                          {item.status === 'active' ? t('admin.suspend') : t('admin.activate')}
                        </button>
                        <button
                          type="button"
                          className="mini-btn danger"
                          onClick={() => remove(item)}
                          disabled={item.id === me?.id}
                          aria-label={t('common.delete')}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  )
}
