import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'CJID and Media Ecosystem Scramble Dash',
  description: 'Unscramble the definition and type the correct acronym!',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-black text-white flex items-center justify-center h-screen">
        {children}
      </body>
    </html>
  )
}