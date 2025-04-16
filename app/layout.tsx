import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Calculadora Financiamento Imobiliário',
  description: 'Calculadora de financiamento imobiliário com juros simples e compostos',
  generator: 'v0.dev',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode 
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
