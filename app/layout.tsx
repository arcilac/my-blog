import type { ReactNode } from 'react'
import './globals.css'
import Navbar from '@/components/navbar'
import Footer from '@/components/footer'
import { ThemeProvider } from '@/components/theme-provider'

export const metadata = {
  title: 'My Personal Blog',
  description: 'A personal blog connected with Notion',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className="bg-black text-white min-h-screen flex flex-col">
        <ThemeProvider defaultTheme="dark">
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <div className="flex-grow">{children}</div>
            <Footer />
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}
