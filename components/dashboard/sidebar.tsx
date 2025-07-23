"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { 
  BarChart3, 
  Users, 
  Building2, 
  Calendar, 
  MessageSquare, 
  Settings,
  Shield,
  Home
} from "lucide-react";
import { UserRole } from "@/lib/utils/permissions";

interface DashboardSidebarProps {
  userRole: UserRole;
}

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: UserRole[];
}

const navItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/super-admin",
    icon: Home,
    roles: ["super_admin", "admin", "moderator", "club_owner"],
  },
  {
    title: "Analytics",
    href: "/dashboard/analytics",
    icon: BarChart3,
    roles: ["super_admin"],
  },
  {
    title: "Users",
    href: "/super-admin/users",
    icon: Users,
    roles: ["super_admin", "admin"],
  },
  {
    title: "Venues",
    href: "/super-admin/venues",
    icon: Building2,
    roles: ["super_admin", "admin"],
  },
  {
    title: "Events",
    href: "/super-admin/events",
    icon: Calendar,
    roles: ["super_admin", "admin"],
  },
  {
    title: "Reports",
    href: "/super-admin/reports",
    icon: MessageSquare,
    roles: ["super_admin", "admin", "moderator"],
  },
  {
    title: "Admin Users",
    href: "/super-admin/admin-users",
    icon: Shield,
    roles: ["super_admin"],
  },
  {
    title: "Settings",
    href: "/super-admin/settings",
    icon: Settings,
    roles: ["super_admin"],
  },
];

export function DashboardSidebar({ userRole }: DashboardSidebarProps) {
  const pathname = usePathname();

  const filteredNavItems = navItems.filter(item => 
    userRole && item.roles.includes(userRole)
  );

  return (
    <div className="hidden md:flex md:w-64 md:flex-col">
      <div className="flex flex-col flex-grow pt-5 bg-white dark:bg-gray-800 overflow-y-auto border-r border-gray-200 dark:border-gray-700">
        <div className="flex items-center flex-shrink-0 px-4">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            BuzzVar Admin
          </h1>
        </div>
        <div className="mt-8 flex-grow flex flex-col">
          <nav className="flex-1 px-2 space-y-1">
            {filteredNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors",
                    isActive
                      ? "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
                      : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white"
                  )}
                >
                  <Icon
                    className={cn(
                      "mr-3 h-5 w-5 flex-shrink-0",
                      isActive
                        ? "text-gray-500 dark:text-gray-300"
                        : "text-gray-400 dark:text-gray-400 group-hover:text-gray-500 dark:group-hover:text-gray-300"
                    )}
                  />
                  {item.title}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </div>
  );
}