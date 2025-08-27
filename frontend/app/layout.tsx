import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import '../styles/globals.css'
import { ThemeProvider } from '@/components/theme-provider'
import { AuthProvider } from '@/components/providers/AuthProvider'
import { QueryProvider } from '@/src/providers/QueryProvider'
import { Toaster } from 'sonner'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'DataClínica - Sistema de Gestão Médica',
  description: 'Sistema completo para gestão de clínicas e consultórios médicos',
  keywords: 'sistema médico, gestão clínica, prontuário eletrônico, agendamento médico',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <QueryProvider>
            <AuthProvider>
              <div className="min-h-screen bg-background">
                {children}
              </div>
              <Toaster 
                position="top-right"
                richColors
                closeButton
                duration={4000}
              />
            </AuthProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}