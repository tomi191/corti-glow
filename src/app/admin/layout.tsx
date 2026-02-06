"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Tag,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronRight,
} from "lucide-react";

const navItems = [
  {
    href: "/admin",
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    href: "/admin/porachki",
    label: "Поръчки",
    icon: Package,
  },
  {
    href: "/admin/produkti",
    label: "Продукти",
    icon: ShoppingBag,
  },
  {
    href: "/admin/promocii",
    label: "Промоции",
    icon: Tag,
  },
  {
    href: "/admin/klienti",
    label: "Клиенти",
    icon: Users,
  },
  {
    href: "/admin/nastroyki",
    label: "Настройки",
    icon: Settings,
  },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Special layout for login page
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  const handleLogout = () => {
    fetch("/api/admin/auth", { method: "DELETE" })
      .then(() => {
        window.location.href = "/admin/login";
      })
      .catch(() => {
        // Even if API fails, redirect to login (cookie may still exist but middleware will catch it)
        window.location.href = "/admin/login";
      });
  };

  return (
    <div className="min-h-screen bg-stone-100">
      {/* Mobile Header */}
      <div className="lg:hidden bg-white border-b border-stone-200 px-4 py-3 flex items-center justify-between">
        <h1 className="text-lg font-bold text-[#2D4A3E]">LuraLab Admin</h1>
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 hover:bg-stone-100 rounded-lg"
        >
          {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={`
            fixed lg:static inset-y-0 left-0 z-50
            w-64 bg-white border-r border-stone-200
            transform transition-transform duration-200
            ${isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
            lg:min-h-screen
          `}
        >
          {/* Logo */}
          <div className="hidden lg:flex items-center gap-2 px-6 py-5 border-b border-stone-100">
            <div className="w-8 h-8 bg-[#2D4A3E] rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">LL</span>
            </div>
            <span className="font-bold text-[#2D4A3E]">LuraLab Admin</span>
          </div>

          {/* Navigation */}
          <nav className="p-4 space-y-1">
            {navItems.map((item) => {
              const isActive =
                item.href === "/admin"
                  ? pathname === "/admin"
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsSidebarOpen(false)}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-xl transition-all
                    ${isActive
                      ? "bg-[#2D4A3E] text-white"
                      : "text-stone-600 hover:bg-stone-100"
                    }
                  `}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                  {isActive && <ChevronRight className="w-4 h-4 ml-auto" />}
                </Link>
              );
            })}
          </nav>

          {/* Logout */}
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-stone-100">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-3 w-full text-stone-600 hover:bg-stone-100 rounded-xl transition"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Изход</span>
            </button>
          </div>
        </aside>

        {/* Mobile Overlay */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 p-4 lg:p-8 min-h-screen">{children}</main>
      </div>
    </div>
  );
}
