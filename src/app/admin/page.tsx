"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  DollarSign,
  Package,
  TrendingUp,
  Users,
  ChevronRight,
  Clock,
  AlertCircle,
} from "lucide-react";
import { formatPrice } from "@/lib/utils";

interface DashboardStats {
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  shippedOrders: number;
}

interface RecentOrder {
  id: string;
  order_number: string;
  customer_first_name: string;
  customer_last_name: string;
  total: number;
  status: string;
  created_at: string;
}

const statusColors: Record<string, string> = {
  new: "bg-blue-100 text-blue-700",
  processing: "bg-yellow-100 text-yellow-700",
  shipped: "bg-purple-100 text-purple-700",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};

const statusLabels: Record<string, string> = {
  new: "Нова",
  processing: "В обработка",
  shipped: "Изпратена",
  delivered: "Доставена",
  cancelled: "Отказана",
};

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, ordersRes] = await Promise.all([
          fetch("/api/admin/stats"),
          fetch("/api/admin/orders?limit=5"),
        ]);

        if (statsRes.ok) {
          const statsData = await statsRes.json();
          setStats(statsData);
        }

        if (ordersRes.ok) {
          const ordersData = await ordersRes.json();
          setRecentOrders(ordersData.orders || []);
        }
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const statCards = [
    {
      label: "Общо Приходи",
      value: stats ? formatPrice(stats.totalRevenue) : "---",
      icon: DollarSign,
      color: "bg-green-500",
    },
    {
      label: "Общо Поръчки",
      value: stats?.totalOrders.toString() || "---",
      icon: Package,
      color: "bg-blue-500",
    },
    {
      label: "Чакащи",
      value: stats?.pendingOrders.toString() || "---",
      icon: Clock,
      color: "bg-yellow-500",
    },
    {
      label: "Изпратени",
      value: stats?.shippedOrders.toString() || "---",
      icon: TrendingUp,
      color: "bg-purple-500",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#2D4A3E]">Dashboard</h1>
        <p className="text-stone-500 text-sm mt-1">
          Преглед на магазина
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-stone-500">{stat.label}</p>
                <p className="text-2xl font-bold text-stone-800 mt-1">
                  {isLoading ? (
                    <span className="animate-pulse">---</span>
                  ) : (
                    stat.value
                  )}
                </p>
              </div>
              <div
                className={`w-10 h-10 rounded-xl ${stat.color} flex items-center justify-center`}
              >
                <stat.icon className="w-5 h-5 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between">
          <h2 className="font-semibold text-[#2D4A3E]">Последни Поръчки</h2>
          <Link
            href="/admin/porachki"
            className="text-sm text-[#2D4A3E] hover:underline flex items-center gap-1"
          >
            Виж всички
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {isLoading ? (
          <div className="p-8 text-center">
            <div className="w-8 h-8 border-3 border-[#2D4A3E] border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : recentOrders.length === 0 ? (
          <div className="p-8 text-center">
            <AlertCircle className="w-12 h-12 text-stone-300 mx-auto mb-3" />
            <p className="text-stone-500">Няма поръчки</p>
            <p className="text-xs text-stone-400 mt-1">
              Поръчките ще се появят тук след като имате първата
            </p>
          </div>
        ) : (
          <div className="divide-y divide-stone-100">
            {recentOrders.map((order) => (
              <Link
                key={order.id}
                href={`/admin/porachki/${order.id}`}
                className="flex items-center justify-between px-6 py-4 hover:bg-stone-50 transition"
              >
                <div className="flex items-center gap-4">
                  <div>
                    <p className="font-medium text-stone-800">
                      {order.order_number}
                    </p>
                    <p className="text-sm text-stone-500">
                      {order.customer_first_name} {order.customer_last_name}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      statusColors[order.status] || "bg-stone-100 text-stone-700"
                    }`}
                  >
                    {statusLabels[order.status] || order.status}
                  </span>
                  <span className="font-bold text-stone-800">
                    {formatPrice(order.total)}
                  </span>
                  <ChevronRight className="w-4 h-4 text-stone-400" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Link
          href="/admin/porachki?status=new"
          className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100 hover:shadow-md transition group"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
              <Package className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="font-semibold text-stone-800 group-hover:text-[#2D4A3E] transition">
                Нови Поръчки
              </p>
              <p className="text-sm text-stone-500">
                {stats?.pendingOrders || 0} чакащи
              </p>
            </div>
          </div>
        </Link>

        <Link
          href="/admin/klienti"
          className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100 hover:shadow-md transition group"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="font-semibold text-stone-800 group-hover:text-[#2D4A3E] transition">
                Клиенти
              </p>
              <p className="text-sm text-stone-500">Виж всички клиенти</p>
            </div>
          </div>
        </Link>

        <Link
          href="/admin/nastroyki"
          className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100 hover:shadow-md transition group"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-stone-100 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-stone-600" />
            </div>
            <div>
              <p className="font-semibold text-stone-800 group-hover:text-[#2D4A3E] transition">
                Настройки
              </p>
              <p className="text-sm text-stone-500">Конфигурация</p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}
