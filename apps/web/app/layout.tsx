import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "SaaS Licitação",
  description: "Plataforma de gestão de licitações públicas",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  )
}
