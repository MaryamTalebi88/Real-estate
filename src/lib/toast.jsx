import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { Check, Info, X } from 'lucide-react'

const ToastContext = createContext(null)
let seq = 0

export function ToastProvider({ children }) {
  const [items, setItems] = useState([])

  const dismiss = useCallback((id) => {
    setItems((list) => list.filter((t) => t.id !== id))
  }, [])

  const push = useCallback(
    (message, type = 'info') => {
      const id = ++seq
      setItems((list) => [...list, { id, message, type }])
      window.setTimeout(() => dismiss(id), 4200)
      return id
    },
    [dismiss],
  )

  const value = useMemo(
    () => ({
      push,
      success: (m) => push(m, 'success'),
      error: (m) => push(m, 'error'),
      dismiss,
    }),
    [push, dismiss],
  )

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="toast-stack" role="status" aria-live="polite">
        {items.map((item) => (
          <div key={item.id} className={`toast ${item.type}`}>
            {item.type === 'success' ? <Check size={17} /> : <Info size={17} />}
            <span className="grow">{item.message}</span>
            <button type="button" aria-label="Dismiss" onClick={() => dismiss(item.id)}>
              <X size={15} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used inside ToastProvider')
  return ctx
}
