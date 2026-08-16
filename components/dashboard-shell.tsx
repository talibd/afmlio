import type { CSSProperties, ReactNode } from "react"

import { AppSidebar, DashboardHeader } from "@/components/app-sidebar"
import { SidebarProvider } from "@/components/ui/sidebar"

export function DashboardShell({
  children,
  header = true,
}: {
  children: ReactNode
  header?: boolean
}) {
  return (
    <SidebarProvider
      className="afm-dashboard no-scrollbar h-svh overflow-hidden"
      style={{ "--sidebar-width": "17.25rem" } as CSSProperties}
    >
      <AppSidebar />
      <main className="min-h-0 flex-1 overflow-y-auto md:bg-sidebar md:p-2">
        <div className="flex h-full flex-col overflow-hidden bg-background md:rounded-xl">
          {header ? <DashboardHeader /> : null}
          <div className="min-h-0 flex-1 overflow-hidden">{children}</div>
        </div>
      </main>
    </SidebarProvider>
  )
}
