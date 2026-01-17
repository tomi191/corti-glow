"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    // Check if already authenticated
    const authToken = sessionStorage.getItem("admin_auth");
    if (authToken === "authenticated") {
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        sessionStorage.setItem("admin_auth", "authenticated");
        setIsAuthenticated(true);
      } else {
        setError("Грешна парола");
      }
    } catch (err) {
      setError("Възникна грешка");
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("admin_auth");
    setIsAuthenticated(false);
    setPassword("");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-stone-100 flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-[#2D4A3E] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Login Screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-stone-100 flex items-center justify-center p-4">
        <div className="w-full max-w-sm">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-[#2D4A3E]">LuraLab Admin</h1>
              <p className="text-stone-500 text-sm mt-1">
                Въведете паролата за достъп
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Парола"
                  className="w-full px-4 py-3 border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-[#2D4A3E] focus:ring-1 focus:ring-[#2D4A3E]"
                  autoFocus
                />
              </div>

              {error && (
                <p className="text-red-500 text-sm text-center">{error}</p>
              )}

              <button
                type="submit"
                className="w-full py-3 bg-[#2D4A3E] text-white rounded-xl font-semibold hover:bg-[#1f352c] transition"
              >
                Вход
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // Admin Dashboard Layout
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
