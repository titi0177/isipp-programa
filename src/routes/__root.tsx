import { HeadContent, Scripts, createRootRoute, Outlet } from '@tanstack/react-router'
import { ToastProvider } from '@/components/Toast'
import '../styles.css'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: 'ISIPP Academic System' },
    ],
  }),
  shellComponent: RootDocument,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <head>
        <HeadContent />
      </head>
      <body>
        <ToastProvider>
          {children}
        </ToastProvider>
        <Scripts />
      </body>
    </html>
  )
}
