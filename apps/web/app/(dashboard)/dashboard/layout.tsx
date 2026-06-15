"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Building2,
  FileText,
  Users,
  Settings,
  LayoutDashboard,
  ArrowRightLeft,
  UserCog,
  ClipboardCheck,
} from "lucide-react"

const navItems = [
  { href: "/dashboard", label: "Visão Geral", icon: LayoutDashboard },
  { href: "/dashboard/orgaos", label: "Órgãos", icon: Building2 },
  { href: "/dashboard/fornecedores", label: "Fornecedores", icon: Users },
  { href: "/dashboard/workflow", label: "Workflow", icon: ArrowRightLeft },
  { href: "/dashboard/propostas", label: "Propostas", icon: ClipboardCheck },
  { href: "/dashboard/usuarios", label: "Usuários", icon: UserCog },
  { href: "/dashboard/config", label: "Configurações", icon: Settings },
]

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  return (
    <div className="flex flex-1 overflow-hidden">
      <aside className="w-64 border-r border-gray-200 bg-white hidden lg:block">
        <nav className="p-4 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-primary text-white"
                    : "text-muted hover:bg-gray-100 hover:text-foreground"
                }`}
              >
                <item.icon className="size-4" />
                {item.label}
              </Link>
            )
          })}
        </nav>
      </aside>
      <main className="flex-1 overflow-y-auto p-6 bg-gray-50">
        {children}
      </main>
    </div>
  )
}
