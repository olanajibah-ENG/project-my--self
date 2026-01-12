import { Outlet } from 'react-router-dom'
import Header from './Header'
import Sidebar from './Sidebar'
import type { LucideIcon } from 'lucide-react'

interface NavItem {
  label: string
  href: string
  icon: LucideIcon
}

interface DashboardLayoutProps {
  sidebarItems: NavItem[]
}

export default function DashboardLayout({ sidebarItems }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex">
        <Sidebar items={sidebarItems} />
        <Outlet />
      </div>
    </div>
  )
}
