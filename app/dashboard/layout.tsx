import type { ReactNode } from "react"

import { DashboardShell } from "@/components/dashboard-shell"

import "./dashboard.css"

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return <DashboardShell>{children}</DashboardShell>
}
