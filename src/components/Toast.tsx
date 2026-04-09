import { useState, useEffect, createContext, useContext, useCallback } from 'react'
import { CheckCircle, XCircle, AlertCircle, X } from 'lucide-react'

type ToastType = 'success' | 'error' | 'info'

interface Toast {
  id: string
  type: ToastType
  message: string
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void
}

const ToastContext = createContext<ToastContextType>({ showToast: () => {} })

export function useToast() {
  return useContext(ToastContext)
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const showToast = useCallback((message: string, type: ToastType = 'success') => {
    const id = Math.random().toString(36).slice(2)
    setToasts(prev => [...prev, { id, type, message }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000)
  }, [])

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-[100] space-y-2">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`flex min-w-[280px] items-center gap-3 border border-[var(--siu-border)] bg-white px-4 py-3 text-sm text-slate-800 shadow-lg ${
              toast.type === 'success' ? 'border-l-4 border-l-emerald-600' :
              toast.type === 'error' ? 'border-l-4 border-l-red-600' : 'border-l-4 border-l-[var(--siu-blue)]'
            }`}
            style={{ borderRadius: '2px' }}
          >
            {toast.type === 'success' && <CheckCircle size={18} className="shrink-0 text-emerald-600" />}
            {toast.type === 'error' && <XCircle size={18} className="shrink-0 text-red-600" />}
            {toast.type === 'info' && <AlertCircle size={18} className="shrink-0 text-[var(--siu-blue)]" />}
            <span className="flex-1 font-medium leading-snug">{toast.message}</span>
            <button
              type="button"
              onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
              className="shrink-0 text-slate-400 hover:text-slate-700"
              aria-label="Cerrar aviso"
            >
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}
