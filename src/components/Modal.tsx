import { X } from 'lucide-react'
import { useEffect } from 'react'

interface ModalProps {
  open: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg'
}

export function Modal({ open, onClose, title, children, size = 'md' }: ModalProps) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [open])

  if (!open) return null

  const sizeClass = size === 'sm' ? 'max-w-sm' : size === 'lg' ? 'max-w-2xl' : 'max-w-lg'

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className={`modal-content w-full ${sizeClass}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="siu-modal-head">
          <h2>{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-sm p-1.5 text-white/80 transition-colors hover:bg-white/15 hover:text-white"
            aria-label="Cerrar"
          >
            <X size={20} />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  )
}
