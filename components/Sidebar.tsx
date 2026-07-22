"use client";

import { useAuth } from "@/lib/context/AuthContext";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useState } from "react";
import {
  LayoutDashboard,
  FolderKanban,
  Users,
  FileText,
  BarChart3,
  Scale,
  MessageSquare,
  DollarSign,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Menu,
  X,
} from "lucide-react";

const navigationItems = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    roles: ["ADMIN", "EDITOR", "VIEWER"],
  },
  {
    label: "Projects",
    href: "/projects",
    icon: FolderKanban,
    roles: ["ADMIN", "EDITOR", "VIEWER"],
  },
  {
    label: "PAPs",
    href: "/paps",
    icon: Users,
    roles: ["ADMIN", "EDITOR", "VIEWER"],
  },
  {
    label: "Council",
    href: "/council",
    icon: Scale,
    roles: ["ADMIN", "EDITOR"],
  },
  {
    label: "Complaints",
    href: "/complaints",
    icon: MessageSquare,
    roles: ["ADMIN", "EDITOR", "VIEWER"],
  },
  {
    label: "Payments",
    href: "/payments",
    icon: DollarSign,
    roles: ["ADMIN", "EDITOR", "VIEWER"],
  },
  {
    label: "Users",
    href: "/users",
    icon: Users,
    roles: ["ADMIN"],
  },
  {
    label: "Reports",
    href: "/reports",
    icon: BarChart3,
    roles: ["ADMIN", "EDITOR", "VIEWER"],
  },
  {
    label: "Audit Log",
    href: "/audit",
    icon: FileText,
    roles: ["ADMIN"],
  },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const filteredNav = navigationItems.filter((item) =>
    item.roles.includes(user?.role || "VIEWER")
  );

  return (
    <>
      {/* Mobile menu toggle */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="fixed top-4 left-4 z-50 lg:hidden bg-[#1E3A8A] text-white p-2 rounded-lg shadow-lg"
        aria-label="Toggle menu"
      >
        {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-30 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-40 h-full bg-white border-r border-[#E2E8F0] shadow-sm transition-all duration-300 flex flex-col",
          collapsed ? "w-[72px]" : "w-[260px]",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Logo */}
        <div
          className={cn(
            "flex items-center gap-3 px-4 h-16 border-b border-[#E2E8F0] shrink-0",
            collapsed && "justify-center px-0"
          )}
        >
          <div className="w-9 h-9 bg-[#1E3A8A] rounded-lg flex items-center justify-center shrink-0">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <h2 className="text-sm font-bold text-[#0F172A] truncate">MEIS</h2>
              <p className="text-[10px] text-[#64748B] truncate">Expropriation System</p>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {filteredNav.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                  collapsed && "justify-center px-0",
                  isActive
                    ? "bg-[#DBEAFE] text-[#1E3A8A]"
                    : "text-[#64748B] hover:bg-[#F8FAFC] hover:text-[#0F172A]"
                )}
                title={collapsed ? item.label : undefined}
              >
                <Icon className={cn("w-5 h-5 shrink-0", isActive ? "text-[#1E3A8A]" : "text-[#64748B]")} />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Collapse toggle (desktop) */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden lg:flex items-center justify-center h-10 mx-3 mb-2 rounded-lg text-[#64748B] hover:bg-[#F8FAFC] transition-colors"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>

        {/* User section */}
        <div
          className={cn(
            "border-t border-[#E2E8F0] p-3 shrink-0",
            collapsed && "flex flex-col items-center"
          )}
        >
          <div
            className={cn(
              "flex items-center gap-3",
              collapsed ? "flex-col" : "w-full"
            )}
          >
            <div className="w-8 h-8 bg-[#1E3A8A] rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0">
              {user?.name?.charAt(0)?.toUpperCase() || "U"}
            </div>
            {!collapsed && (
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-[#0F172A] truncate">{user?.name}</p>
                <p className="text-xs text-[#64748B] truncate capitalize">{user?.role?.toLowerCase()}</p>
              </div>
            )}
            {!collapsed && (
              <button
                onClick={logout}
                className="p-1.5 rounded-lg text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#DC2626] transition-colors shrink-0"
                title="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}

