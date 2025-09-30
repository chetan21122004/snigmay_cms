import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ThemeProvider } from '@/components/theme-provider'
import CenterProviderWrapper from '@/components/center-provider-wrapper'
import { Toaster } from '@/components/ui/sonner'
import '@/lib/suppress-warnings'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Snigmay Pune FC - Management System',
  description: 'Attendance & Fee Management System for Snigmay Pune FC',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <CenterProviderWrapper>
            {children}
            <Toaster />
          </CenterProviderWrapper>
        </ThemeProvider>
      </body>
    </html>
  )
}
