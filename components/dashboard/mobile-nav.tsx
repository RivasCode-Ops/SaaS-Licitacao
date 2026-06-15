"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, X, LayoutDashboard, Building2, Users, ArrowRightLeft, UserCog, Settings } from "lucide-react"

const navItems = [
  { href: "/dashboard", label: "Visão Geral", icon: LayoutDashboard },
  { href: "/dashboard/orgaos", label: "Órgãos", icon: Building2 },
  { href: "/dashboard/fornecedores", label: "Fornecedores", icon: Users },
  { href: "/dashboard/workflow", label: "Workflow", icon: ArrowRightLeft },
  { href: "/dashboard/usuarios", label: "Usuários", icon: UserCog },
  { href: "/dashboard/config", label: "Configurações", icon: Settings },
]

export function MobileNav() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="lg:hidden p-2 -ml-2 text-muted hover:text-foreground"
        aria-label="Abrir menu"
      >
        <Menu className="size-5" />
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/40 lg:hidden"
          onClick={() => setOpen(false)}
        >
          <aside
            className="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl animate-in slide-in-from-left"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 h-16 border-b border-gray-200">
              <span className="text-lg font-bold text-primary">SaaS Licitação</span>
              <button
                onClick={() => setOpen(false)}
                className="p-2 text-muted hover:text-foreground"
                aria-label="Fechar menu"
              >
                <X className="size-5" />
              </button>
            </div>

            <nav className="p-4 space-y-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
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
        </div>
      )}
    </>
  )
}
