"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Mail,
  Users,
  Send,
  FileText,
  RefreshCw,
  Eye,
  Loader2,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

type Tab = "audience" | "broadcasts" | "templates";

interface AudienceStats {
  audienceId: string;
  total: number;
  subscribed: number;
  unsubscribed: number;
}

interface Contact {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  unsubscribed: boolean;
  createdAt: string;
}

interface Template {
  id: string;
  name: string;
  category: string;
  description: string;
}

export default function AdminEmailPage() {
  const [tab, setTab] = useState<Tab>("audience");
  const [stats, setStats] = useState<AudienceStats | null>(null);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<string | null>(null);
  const [previewHtml, setPreviewHtml] = useState<string | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<string | null>(null);
  const [testSending, setTestSending] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<{ id: string; msg: string } | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      if (tab === "audience") {
        const [statsRes, contactsRes] = await Promise.all([
          fetch("/api/admin/email/audiences"),
          fetch("/api/admin/email/contacts"),
        ]);
        if (statsRes.ok) setStats(await statsRes.json());
        if (contactsRes.ok) {
          const data = await contactsRes.json();
          setContacts(data.contacts || []);
        }
      } else if (tab === "templates") {
        const res = await fetch("/api/admin/email/templates");
        if (res.ok) {
          const data = await res.json();
          setTemplates(data.templates || []);
        }
      }
    } catch (err) {
      console.error("Fetch error:", err);
    }
    setLoading(false);
  }, [tab]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSync = async () => {
    setSyncing(true);
    setSyncResult(null);
    try {
      const res = await fetch("/api/admin/email/contacts/sync", {
        method: "POST",
      });
      const data = await res.json();
      if (data.success) {
        setSyncResult(`Синхронизирани: ${data.synced}, Грешки: ${data.failed}`);
        fetchData();
      } else {
        setSyncResult(`Грешка: ${data.error}`);
      }
    } catch {
      setSyncResult("Грешка при синхронизация");
    }
    setSyncing(false);
  };

  const handlePreview = async (templateId: string) => {
    setPreviewTemplate(templateId);
    setPreviewHtml(null);
    try {
      const res = await fetch("/api/admin/email/templates/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ templateId }),
      });
      const data = await res.json();
      if (data.html) setPreviewHtml(data.html);
    } catch {
      setPreviewHtml("<p>Грешка при зареждане на preview</p>");
    }
  };

  const handleTestSend = async (templateId: string, name: string) => {
    const email = prompt("Въведи имейл за тестово изпращане:");
    if (!email) return;

    setTestSending(templateId);
    setTestResult(null);
    try {
      const res = await fetch("/api/admin/email/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: email,
          template: templateId,
          subject: name,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setTestResult({ id: templateId, msg: `Изпратено до ${email}` });
      } else {
        setTestResult({ id: templateId, msg: `Грешка: ${data.error}` });
      }
    } catch {
      setTestResult({ id: templateId, msg: "Грешка при изпращане" });
    }
    setTestSending(null);
  };

  const tabs: { key: Tab; label: string; icon: typeof Mail }[] = [
    { key: "audience", label: "Аудитория", icon: Users },
    { key: "broadcasts", label: "Broadcasts", icon: Send },
    { key: "templates", label: "Шаблони", icon: FileText },
  ];

  const categoryLabels: Record<string, string> = {
    transactional: "Транзакционни",
    marketing: "Маркетинг",
    internal: "Вътрешни",
    drip: "Drip Sequence",
  };

  const categoryColors: Record<string, string> = {
    transactional: "bg-blue-100 text-blue-700",
    marketing: "bg-green-100 text-green-700",
    internal: "bg-stone-100 text-stone-700",
    drip: "bg-purple-100 text-purple-700",
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#2D4A3E] rounded-xl flex items-center justify-center">
            <Mail className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-stone-900">Имейли</h1>
            <p className="text-sm text-stone-500">
              Resend Audiences, Broadcasts & Templates
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              tab === t.key
                ? "bg-[#2D4A3E] text-white"
                : "bg-white text-stone-600 hover:bg-stone-50 border border-stone-200"
            }`}
          >
            <t.icon className="w-4 h-4" />
            {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-stone-400" />
        </div>
      ) : (
        <>
          {/* ── Audience Tab ── */}
          {tab === "audience" && (
            <div className="space-y-6">
              {/* Stats Cards */}
              {stats && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <StatCard
                    label="Общо контакти"
                    value={stats.total}
                    color="text-[#2D4A3E]"
                  />
                  <StatCard
                    label="Абонирани"
                    value={stats.subscribed}
                    color="text-green-600"
                  />
                  <StatCard
                    label="Отписани"
                    value={stats.unsubscribed}
                    color="text-stone-400"
                  />
                </div>
              )}

              {/* Sync Button */}
              <div className="bg-white rounded-xl border border-stone-200 p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium text-stone-900">
                    Синхронизирай с Supabase
                  </p>
                  <p className="text-sm text-stone-500">
                    Импортирай newsletter subscribers в Resend Audiences
                  </p>
                </div>
                <button
                  onClick={handleSync}
                  disabled={syncing}
                  className="flex items-center gap-2 px-4 py-2 bg-[#2D4A3E] text-white rounded-lg hover:bg-[#243d33] disabled:opacity-50 transition"
                >
                  <RefreshCw
                    className={`w-4 h-4 ${syncing ? "animate-spin" : ""}`}
                  />
                  {syncing ? "Синхронизиране..." : "Sync"}
                </button>
              </div>

              {syncResult && (
                <div className="bg-stone-50 rounded-lg p-3 text-sm text-stone-700">
                  {syncResult}
                </div>
              )}

              {/* Contacts Table */}
              <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
                <div className="px-4 py-3 border-b border-stone-100">
                  <h3 className="font-medium text-stone-900">
                    Контакти ({contacts.length})
                  </h3>
                </div>
                {contacts.length === 0 ? (
                  <div className="p-8 text-center text-stone-400">
                    <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>Няма контакти в Resend Audience.</p>
                    <p className="text-sm">
                      Натисни Sync за да импортираш от Supabase.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-stone-50 text-left text-sm text-stone-500">
                          <th className="px-4 py-2">Имейл</th>
                          <th className="px-4 py-2">Име</th>
                          <th className="px-4 py-2">Статус</th>
                          <th className="px-4 py-2">Дата</th>
                        </tr>
                      </thead>
                      <tbody>
                        {contacts.slice(0, 50).map((c) => (
                          <tr
                            key={c.id}
                            className="border-t border-stone-50 hover:bg-stone-50"
                          >
                            <td className="px-4 py-3 text-sm">{c.email}</td>
                            <td className="px-4 py-3 text-sm text-stone-600">
                              {c.firstName} {c.lastName}
                            </td>
                            <td className="px-4 py-3">
                              <span
                                className={`text-xs px-2 py-1 rounded-full ${
                                  c.unsubscribed
                                    ? "bg-red-50 text-red-600"
                                    : "bg-green-50 text-green-600"
                                }`}
                              >
                                {c.unsubscribed ? "Отписан" : "Активен"}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm text-stone-400">
                              {new Date(c.createdAt).toLocaleDateString("bg-BG")}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── Broadcasts Tab ── */}
          {tab === "broadcasts" && (
            <div className="bg-white rounded-xl border border-stone-200 p-8 text-center">
              <Send className="w-10 h-10 mx-auto mb-4 text-stone-300" />
              <h3 className="text-lg font-medium text-stone-900 mb-2">
                Broadcasts
              </h3>
              <p className="text-stone-500 mb-4 max-w-md mx-auto">
                Използвай Resend Dashboard за управление на broadcasts, или
                изпрати тестов имейл от таба &quot;Шаблони&quot;.
              </p>
              <a
                href="https://resend.com/broadcasts"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#2D4A3E] text-white rounded-lg hover:bg-[#243d33] transition"
              >
                <Send className="w-4 h-4" />
                Отвори Resend Dashboard
              </a>
            </div>
          )}

          {/* ── Templates Tab ── */}
          {tab === "templates" && (
            <div className="space-y-4">
              {templates.map((t) => (
                <div
                  key={t.id}
                  className="bg-white rounded-xl border border-stone-200 p-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium text-stone-900">
                            {t.name}
                          </h3>
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full ${
                              categoryColors[t.category] || "bg-stone-100 text-stone-600"
                            }`}
                          >
                            {categoryLabels[t.category] || t.category}
                          </span>
                        </div>
                        <p className="text-sm text-stone-500">
                          {t.description}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handlePreview(t.id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-stone-100 text-stone-700 rounded-lg hover:bg-stone-200 transition"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Preview
                      </button>
                      {["drip", "marketing"].includes(t.category) && (
                        <button
                          onClick={() => handleTestSend(t.id, t.name)}
                          disabled={testSending === t.id}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-[#2D4A3E] text-white rounded-lg hover:bg-[#243d33] disabled:opacity-50 transition"
                        >
                          {testSending === t.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Send className="w-3.5 h-3.5" />
                          )}
                          Тест
                        </button>
                      )}
                    </div>
                  </div>
                  {/* Test result */}
                  {testResult?.id === t.id && (
                    <div className="mt-2 flex items-center gap-2 text-sm">
                      {testResult.msg.includes("Грешка") ? (
                        <AlertCircle className="w-4 h-4 text-red-500" />
                      ) : (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      )}
                      <span className="text-stone-600">{testResult.msg}</span>
                    </div>
                  )}
                  {/* Preview iframe */}
                  {previewTemplate === t.id && previewHtml && (
                    <div className="mt-4 border border-stone-200 rounded-lg overflow-hidden">
                      <iframe
                        srcDoc={previewHtml}
                        title={`Preview: ${t.name}`}
                        className="w-full h-[600px] bg-white"
                        sandbox="allow-same-origin"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-stone-200 p-5">
      <p className="text-sm text-stone-500 mb-1">{label}</p>
      <p className={`text-3xl font-bold ${color}`}>{value}</p>
    </div>
  );
}
