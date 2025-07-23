'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { UserRole } from '@/lib/utils/permissions'
import { 
  BarChart3, 
  Users, 
  Building, 
  UserCog, 
  Flag, 
  Bell, 
  Calendar,
  Percent,
  Star
} from 'lucide-react'

interface SidebarProps {
  userRole: UserRole
}

interface NavItem {
  title: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  roles: UserRole[]
}

const navItems: NavItem[] = [
  // Super Admin items
  {
    title: 'System Analytics',
    href: '/super-admin',
    icon: BarChart3,
    roles: ['super_admin']
  },
  {
    title: 'User Management',
    href: '/super-admin/users',
    icon: Users,
    roles: ['super_admin']
  },
  {
    title: 'Venue Management',
    href: '/super-admin/venues',
    icon: Building,
    roles: ['super_admin']
  },
  {
    title: 'Admin Users',
    href: '/super-admin/admin-users',
    icon: UserCog,
    roles: ['super_admin']
  },
  
  // Admin items
  {
    title: 'Moderation',
    href: '/admin',
    icon: Flag,
    roles: ['admin']
  },
  {
    title: 'Reports',
    href: '/admin/reports',
    icon: Flag,
    roles: ['admin']
  },
  {
    title: 'Venue Moderation',
    href: '/admin/venues',
    icon: Building,
    roles: ['admin']
  },
  {
    title: 'Notifications',
    href: '/admin/notifications',
    icon: Bell,
    roles: ['admin']
  },
  
  // Club Owner items
  {
    title: 'My Dashboard',
    href: '/club-owner',
    icon: BarChart3,
    roles: ['club_owner']
  },
  {
    title: 'My Venues',
    href: '/club-owner/venues',
    icon: Building,
    roles: ['club_owner']
  },
  {
    title: 'Events',
    href: '/club-owner/events',
    icon: Calendar,
    roles: ['club_owner']
  },
  {
    title: 'Promotions',
    href: '/club-owner/promotions',
    icon: Percent,
    roles: ['club_owner']
  },
  {
    title: 'Reviews',
    href: '/club-owner/reviews',
    icon: Star,
    roles: ['club_owner']
  }
]

export function DashboardSidebar({ userRole }: SidebarProps) {
  const pathname = usePathname()
  
  const filteredNavItems = navItems.filter(item => 
    item.roles.includes(userRole)
  )

  const getRoleTitle = (role: UserRole) => {
    switch (role) {
      case 'super_admin':
        return 'Super Admin'
      case 'admin':
        return 'Admin'
      case 'club_owner':
        return 'Club Owner'
      default:
        return 'User'
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 w-64 min-h-screen shadow-lg">
      <div className="p-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
          BuzzVar
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
          {getRoleTitle(userRole)}
        </p>
      </div>
      
      <nav className="mt-6">
        <div className="px-6 py-2">
          <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            Navigation
          </h3>
        </div>
        
        <div className="mt-2">
          {filteredNavItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href || 
              (item.href !== '/' && pathname.startsWith(item.href))
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center px-6 py-3 text-sm font-medium transition-colors duration-200',
                  isActive
                    ? 'bg-blue-50 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 border-r-2 border-blue-700 dark:border-blue-300'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                )}
              >
                <Icon className="mr-3 h-5 w-5" />
                {item.title}
              </Link>
            )
          })}
        </div>
      </nav>
    </div>
  )
}