'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  LayoutDashboard,
  Users,
  Building2,
  Calendar,
  BarChart3,
  Shield,
  Settings,
  Eye,
  UserCheck,
  MapPin,
  Star,
  TrendingUp,
  Activity,
  ChevronLeft,
  ChevronRight,
  Zap,
  Home,
  LogOut
} from 'lucide-react'

const navigation = [
  {
    name: 'Dashboard',
    href: '/super-admin',
    icon: LayoutDashboard,
  },
  {
    name: 'User Management',
    icon: Users,
    children: [
      { name: 'All Users', href: '/super-admin/users', icon: UserCheck },
      { name: 'Admin Users', href: '/super-admin/admin-users', icon: Shield },
    ],
  },
  {
    name: 'Venue Management',
    icon: Building2,
    children: [
      { name: 'All Venues', href: '/super-admin/venues', icon: MapPin },
      { name: 'Pending Verification', href: '/super-admin/venues/pending', icon: Eye },
    ],
  },
  {
    name: 'Analytics',
    icon: BarChart3,
    children: [
      { name: 'System Analytics', href: '/super-admin/analytics', icon: TrendingUp },
      { name: 'Reports', href: '/super-admin/reports', icon: Activity },
    ],
  },
  {
    name: 'Settings',
    href: '/super-admin/settings',
    icon: Settings,
  },
]

const otherDashboards = [
  {
    name: 'Admin Dashboard',
    href: '/admin',
    icon: Shield,
    color: 'text-blue-600',
  },
  {
    name: 'Club Owner Dashboard',
    href: '/club-owner',
    icon: Building2,
    color: 'text-green-600',
  },
  {
    name: 'Public Interface',
    href: '/venues',
    icon: Star,
    color: 'text-purple-600',
  },
]

export function SuperAdminSidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const pathname = usePathname()

  return (
    <div className={cn(
      'flex flex-col bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-all duration-300',
      collapsed ? 'w-16' : 'w-64'
    )}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        {!collapsed && (
          <Link href="/" className="flex items-center gap-2">
            <div className="h-8 w-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-lg bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              BuzzVar
            </span>
          </Link>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCollapsed(!collapsed)}
          className="h-8 w-8 p-0"
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-2">
          {/* Main Navigation */}
          <div className="space-y-1">
            {!collapsed && (
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                Super Admin
              </p>
            )}
            {navigation.map((item) => (
              <div key={item.name}>
                {item.href ? (
                  <Link
                    href={item.href}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors',
                      pathname === item.href
                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200'
                        : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                    )}
                  >
                    <item.icon className="h-4 w-4 flex-shrink-0" />
                    {!collapsed && <span>{item.name}</span>}
                  </Link>
                ) : (
                  <div>
                    <div className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                      <item.icon className="h-4 w-4 flex-shrink-0" />
                      {!collapsed && <span>{item.name}</span>}
                    </div>
                    {!collapsed && item.children && (
                      <div className="ml-6 space-y-1">
                        {item.children.map((child) => (
                          <Link
                            key={child.name}
                            href={child.href}
                            className={cn(
                              'flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-colors',
                              pathname === child.href
                                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200'
                                : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700'
                            )}
                          >
                            <child.icon className="h-3 w-3 flex-shrink-0" />
                            <span>{child.name}</span>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Other Dashboards */}
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            {!collapsed && (
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                Other Dashboards
              </p>
            )}
            {otherDashboards.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors',
                  'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                )}
              >
                <item.icon className={cn('h-4 w-4 flex-shrink-0', item.color)} />
                {!collapsed && <span>{item.name}</span>}
              </Link>
            ))}
          </div>
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
        <Link
          href="/"
          className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 rounded-md transition-colors"
        >
          <Home className="h-4 w-4 flex-shrink-0" />
          {!collapsed && <span>Home</span>}
        </Link>
        <form action="/auth/signout" method="post">
          <button
            type="submit"
            className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-100 dark:text-red-400 dark:hover:bg-red-900/20 rounded-md transition-colors w-full"
          >
            <LogOut className="h-4 w-4 flex-shrink-0" />
            {!collapsed && <span>Sign Out</span>}
          </button>
        </form>
      </div>
    </div>
  )
}