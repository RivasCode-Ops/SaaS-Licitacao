import { getSession } from "@/lib/auth/session"
import { logoutAction } from "@/lib/auth/actions"
import Link from "next/link"
import { redirect } from "next/navigation"
import { LogOut, User } from "lucide-react"
import { MobileNav } from "@/components/dashboard/mobile-nav"

export default async function DashboardShellLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getSession()
  if (!session) redirect("/login/sign-in")

  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-b border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <MobileNav />
            <Link href="/dashboard" className="text-lg font-bold text-primary">
              SaaS Licitação
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted hidden sm:inline">
              {session.user.name}
            </span>
            <div className="size-8 rounded-full bg-gray-200 flex items-center justify-center">
              <User className="size-4 text-muted" />
            </div>
            <form action={logoutAction}>
              <button
                type="submit"
                className="flex items-center gap-1 text-sm text-muted hover:text-danger transition-colors"
              >
                <LogOut className="size-4" />
                <span className="hidden sm:inline">Sair</span>
              </button>
            </form>
          </div>
        </div>
      </header>
      {children}
    </div>
  )
}
