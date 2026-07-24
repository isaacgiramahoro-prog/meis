"use client";

import { useAuth } from "@/lib/context/AuthContext";
import DashboardLayout from "@/components/DashboardLayout";
import StatsCard from "@/components/StatsCard";
import { BarChart, DonutChart, StatusBarChart } from "@/components/Charts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  FolderKanban,
  Users,
  FileText,
  DollarSign,
  BarChart3,
  Download,
  Loader2,
  Clock,
  TrendingUp,
  Activity,
  Filter,
} from "lucide-react";
import { useState, useEffect, useCallback } from "react";

// ── Types ────────────────────────────────────────────────────────────
interface DataPoint {
  label: string;
  value: number;
  color: string;
}

interface PaymentDataPoint extends DataPoint {
  bgColor: string;
}

interface MonthlyTrend {
  month: string;
  label: string;
  projectsCreated: number;
  paymentsMade: number;
  papsRegistered: number;
  complaintsFiled: number;
}

interface BudgetAnalysis {
  totalBudget: number;
  totalCompensation: number;
  paidAmount: number;
  remainingBudget: number;
  paymentProgress: number;
  compensationProgress: number;
}

interface RecentActivityItem {
  type: "project" | "payment";
  action: string;
  description: string;
  date: string;
  id: string;
}

interface ReportData {
  summary: {
    totalProjects: number;
    totalPaps: number;
    activePaps: number;
    totalPayments: number;
    completedPayments: number;
    totalComplaints: number;
    resolvedComplaints: number;
    pendingReviews: number;
    totalBudget: number;
    paidAmount: number;
    totalCompensation: number;
  };
  projectStatusData: DataPoint[];
  papStatusData: DataPoint[];
  paymentStatusData: PaymentDataPoint[];
  complaintStatusData: DataPoint[];
  complaintCategoryData: DataPoint[];
  budgetAnalysis: BudgetAnalysis;
  monthlyTrends: MonthlyTrend[];
  recentActivity: RecentActivityItem[];
  projects: Array<{
    id: string;
    name: string;
    location: string;
    budget: number;
    status: string;
    createdAt: string;
    createdBy: { id: string; name: string };
    assignedEditor: { id: string; name: string } | null;
  }>;
  dateRange: { from: string | null; to: string | null };
}

// ── Helpers ───────────────────────────────────────────────────────────
function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-RW", {
    style: "currency",
    currency: "RWF",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatDateTime(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ── Loading Skeleton ──────────────────────────────────────────────────
function LoadingSkeleton() {
  return (
    <DashboardLayout>
      <div className="mb-8">
        <div className="h-8 w-64 bg-[#E2E8F0] rounded-lg animate-pulse mb-2" />
        <div className="h-5 w-48 bg-[#E2E8F0] rounded animate-pulse" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6 mb-8">
        {[...Array(6)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="h-full">
                <div className="h-4 w-24 bg-[#E2E8F0] rounded animate-pulse mb-3" />
                <div className="h-8 w-16 bg-[#E2E8F0] rounded animate-pulse mb-2" />
                <div className="h-3 w-32 bg-[#E2E8F0] rounded animate-pulse" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {[...Array(2)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <div className="h-5 w-40 bg-[#E2E8F0] rounded animate-pulse" />
            </CardHeader>
            <CardContent>
              <div className="h-[200px] bg-[#E2E8F0] rounded-lg animate-pulse" />
            </CardContent>
          </Card>
        ))}
      </div>
    </DashboardLayout>
  );
}

// ── CSV Export Helper ────────────────────────────────────────────────
function downloadCSV(data: ReportData) {
  const rows: string[] = [];

  // Header
  rows.push("MEIS Reports Export");
  rows.push(`Generated: ${new Date().toLocaleString()}`);
  rows.push("");

  // Summary
  rows.push("=== Summary ===");
  rows.push("Metric,Value");
  const summaryItems = [
    ["Total Projects", data.summary.totalProjects],
    ["Total PAPs", data.summary.totalPaps],
    ["Active PAPs", data.summary.activePaps],
    ["Total Payments", data.summary.totalPayments],
    ["Completed Payments", data.summary.completedPayments],
    ["Total Complaints", data.summary.totalComplaints],
    ["Resolved Complaints", data.summary.resolvedComplaints],
    ["Pending Reviews", data.summary.pendingReviews],
    ["Total Budget", formatCurrency(data.summary.totalBudget)],
    ["Paid Amount", formatCurrency(data.summary.paidAmount)],
    ["Total Compensation", formatCurrency(data.summary.totalCompensation)],
  ];
  summaryItems.forEach(([label, value]) => rows.push(`${label},${value}`));
  rows.push("");

  // Project Status Distribution
  rows.push("=== Project Status Distribution ===");
  rows.push("Status,Count");
  data.projectStatusData.forEach((d) => rows.push(`${d.label},${d.value}`));
  rows.push("");

  // PAP Status Distribution
  rows.push("=== PAP Compensation Status ===");
  rows.push("Status,Count");
  data.papStatusData.forEach((d) => rows.push(`${d.label},${d.value}`));
  rows.push("");

  // Payment Status
  rows.push("=== Payment Status ===");
  rows.push("Status,Count");
  data.paymentStatusData.forEach((d) => rows.push(`${d.label},${d.value}`));
  rows.push("");

  // Monthly Trends
  rows.push("=== Monthly Trends (Last 12 Months) ===");
  rows.push("Month,Projects Created,Payments Made,PAPs Registered,Complaints Filed");
  data.monthlyTrends.forEach((m) =>
    rows.push(`${m.label},${m.projectsCreated},${m.paymentsMade},${m.papsRegistered},${m.complaintsFiled}`)
  );
  rows.push("");

  // Projects List
  rows.push("=== Projects ===");
  rows.push("Name,Location,Budget,Status,Created,Creator");
  data.projects.forEach((p) =>
    rows.push(
      `"${p.name}","${p.location}",${formatCurrency(p.budget)},${p.status},${formatDate(p.createdAt)},${p.createdBy.name}`
    )
  );
  rows.push("");

  const csv = rows.join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `meis-report-${new Date().toISOString().split("T")[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// ── Monthly Trends Chart ──────────────────────────────────────────────
function MonthlyTrendsChart({ data }: { data: MonthlyTrend[] }) {
  const allKeys = ["projectsCreated", "paymentsMade", "papsRegistered", "complaintsFiled"] as const;
  const colors: Record<string, string> = {
    projectsCreated: "#1E3A8A",
    paymentsMade: "#16A34A",
    papsRegistered: "#F97316",
    complaintsFiled: "#DC2626",
  };
  const labels: Record<string, string> = {
    projectsCreated: "Projects",
    paymentsMade: "Payments",
    papsRegistered: "PAPs",
    complaintsFiled: "Complaints",
  };

  const maxValue = Math.max(
    ...data.flatMap((m) => allKeys.map((k) => m[k])),
    1
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Monthly Trends (Last 12 Months)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <div className="min-w-[600px]">
            {/* Legend */}
            <div className="flex flex-wrap gap-4 mb-4">
              {allKeys.map((key) => (
                <div key={key} className="flex items-center gap-1.5">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: colors[key] }}
                  />
                  <span className="text-xs text-[#64748B]">{labels[key]}</span>
                </div>
              ))}
            </div>

            {/* Chart */}
            <div className="relative">
              {/* Y-axis labels */}
              <div className="absolute -left-10 top-0 bottom-6 flex flex-col justify-between text-[10px] text-[#94A3B8]">
                <span>{maxValue}</span>
                <span>{Math.round(maxValue / 2)}</span>
                <span>0</span>
              </div>

              <div className="flex gap-2 pl-6">
                {data.map((month) => (
                  <div key={month.month} className="flex-1 flex flex-col items-center gap-1">
                    {/* Bars */}
                    <div className="w-full flex justify-center gap-0.5 items-end" style={{ height: 120 }}>
                      {allKeys.map((key) => {
                        const height = (month[key] / maxValue) * 110;
                        return (
                          <div
                            key={key}
                            className="w-3 rounded-t transition-all duration-300 hover:opacity-80"
                            style={{
                              height: `${Math.max(height, 2)}px`,
                              backgroundColor: colors[key],
                            }}
                            title={`${labels[key]}: ${month[key]}`}
                          />
                        );
                      })}
                    </div>
                    {/* Month label */}
                    <span className="text-[9px] text-[#64748B] text-center whitespace-nowrap">
                      {month.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ── Recent Activity List ──────────────────────────────────────────────
function RecentActivity({ activities }: { activities: RecentActivityItem[] }) {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case "project":
        return <FolderKanban className="w-3.5 h-3.5 text-[#1E3A8A]" />;
      case "payment":
        return <DollarSign className="w-3.5 h-3.5 text-[#16A34A]" />;
      default:
        return <Activity className="w-3.5 h-3.5 text-[#64748B]" />;
    }
  };

  const getActivityBg = (type: string) => {
    switch (type) {
      case "project":
        return "bg-[#DBEAFE]";
      case "payment":
        return "bg-[#DCFCE7]";
      default:
        return "bg-[#F1F5F9]";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <p className="text-sm text-[#64748B] text-center py-4">No recent activity</p>
        ) : (
          <div className="space-y-3">
            {activities.map((item, index) => (
              <div key={`${item.id}-${index}`} className="flex items-start gap-3">
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${getActivityBg(item.type)}`}
                >
                  {getActivityIcon(item.type)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-[#0F172A]">{item.description}</p>
                  <p className="text-xs text-[#94A3B8] mt-0.5">
                    {formatDateTime(item.date)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ── Main Reports Page ─────────────────────────────────────────────────
export default function ReportsPage() {
  const { user } = useAuth();
  const role = user?.role || "VIEWER";

  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Date filter state
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  // Active tab for sections
  const [activeTab, setActiveTab] = useState<"overview" | "financial" | "projects">("overview");

  const fetchReports = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("token");
      const params = new URLSearchParams();
      if (fromDate) params.set("from", fromDate);
      if (toDate) params.set("to", toDate);

      const res = await fetch(`/api/reports?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || "Failed to load reports data");
      }
      setData(json.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  }, [fromDate, toDate]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const handleExportCSV = () => {
    if (data) downloadCSV(data);
  };

  if (loading) return <LoadingSkeleton />;

  // Default data when error or no data
  const summary = data?.summary ?? {
    totalProjects: 0,
    totalPaps: 0,
    activePaps: 0,
    totalPayments: 0,
    completedPayments: 0,
    totalComplaints: 0,
    resolvedComplaints: 0,
    pendingReviews: 0,
    totalBudget: 0,
    paidAmount: 0,
    totalCompensation: 0,
  };

  const projectStatusData = data?.projectStatusData ?? [
    { label: "Active", value: 0, color: "#1E3A8A" },
    { label: "Pending", value: 0, color: "#EAB308" },
    { label: "Completed", value: 0, color: "#16A34A" },
    { label: "Cancelled", value: 0, color: "#6B7280" },
  ];

  const papStatusData = data?.papStatusData ?? [
    { label: "Not Yet Paid", value: 0, color: "#DC2626" },
    { label: "Council Review", value: 0, color: "#EAB308" },
    { label: "Finance Processing", value: 0, color: "#F97316" },
    { label: "Paid", value: 0, color: "#16A34A" },
    { label: "Draft", value: 0, color: "#3B82F6" },
  ];

  const paymentStatusData = data?.paymentStatusData ?? [
    { label: "Paid", value: 0, color: "#16A34A", bgColor: "#DCFCE7" },
    { label: "Pending", value: 0, color: "#DC2626", bgColor: "#FEE2E2" },
    { label: "Failed", value: 0, color: "#DC2626", bgColor: "#FEE2E2" },
    { label: "Cancelled", value: 0, color: "#6B7280", bgColor: "#F3F4F6" },
  ];

  const complaintStatusData = data?.complaintStatusData ?? [
    { label: "Resolved", value: 0, color: "#16A34A" },
    { label: "Under Review", value: 0, color: "#EAB308" },
    { label: "Submitted", value: 0, color: "#F97316" },
    { label: "Rejected", value: 0, color: "#DC2626" },
  ];

  const complaintCategoryData = data?.complaintCategoryData ?? [
    { label: "Land Issue", value: 0, color: "#1E3A8A" },
    { label: "Valuation Issue", value: 0, color: "#EAB308" },
    { label: "Ownership Issue", value: 0, color: "#F97316" },
    { label: "Payment Issue", value: 0, color: "#DC2626" },
    { label: "Other", value: 0, color: "#6B7280" },
  ];

  const budgetAnalysis = data?.budgetAnalysis ?? {
    totalBudget: 0,
    totalCompensation: 0,
    paidAmount: 0,
    remainingBudget: 0,
    paymentProgress: 0,
    compensationProgress: 0,
  };

  const monthlyTrends = data?.monthlyTrends ?? [];
  const recentActivity = data?.recentActivity ?? [];
  const projectsData = data?.projects ?? [];

  // Tab navigation
  const tabs = [
    { id: "overview" as const, label: "Overview", icon: BarChart3 },
    { id: "financial" as const, label: "Financial", icon: DollarSign },
    { id: "projects" as const, label: "Projects", icon: FolderKanban },
  ];

  return (
    <DashboardLayout>
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A]">Reports</h1>
          <p className="text-[#64748B] mt-1">
            Comprehensive reports and analytics
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Date Range Filters */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="px-3 py-2 text-xs border border-[#CBD5E1] rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent text-[#0F172A]"
                title="From date"
              />
            </div>
            <span className="text-xs text-[#64748B]">—</span>
            <div className="relative">
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="px-3 py-2 text-xs border border-[#CBD5E1] rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent text-[#0F172A]"
                title="To date"
              />
            </div>
          </div>
          <button
            onClick={() => {
              setFromDate("");
              setToDate("");
            }}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-[#64748B] border border-[#E2E8F0] rounded-lg hover:bg-[#F8FAFC] transition-colors"
            title="Clear filters"
          >
            <Filter className="w-3.5 h-3.5" />
            Clear
          </button>
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#1E3A8A] text-white text-sm font-semibold rounded-lg hover:bg-[#1D4ED8] transition-colors"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>
      </div>

      {error && (
        <Card className="mb-6 border-[#FECACA] bg-[#FEF2F2]">
          <CardContent className="p-4">
            <p className="text-sm text-[#DC2626]">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Summary Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
        <StatsCard
          title="Total Projects"
          value={summary.totalProjects}
          icon={<FolderKanban className="w-full h-full" />}
          iconBg="bg-[#DBEAFE]"
          iconColor="text-[#1E3A8A]"
          description="Active expropriation projects"
        />
        <StatsCard
          title="Total PAPs"
          value={summary.totalPaps}
          icon={<Users className="w-full h-full" />}
          iconBg="bg-[#CCFBF1]"
          iconColor="text-[#0F766E]"
          description={`${summary.activePaps} active`}
        />
        <StatsCard
          title="Payments"
          value={summary.totalPayments}
          icon={<DollarSign className="w-full h-full" />}
          iconBg="bg-[#DCFCE7]"
          iconColor="text-[#16A34A]"
          description={`${summary.completedPayments} completed`}
        />
        <StatsCard
          title="Complaints"
          value={summary.totalComplaints}
          icon={<FileText className="w-full h-full" />}
          iconBg="bg-[#FEF9C3]"
          iconColor="text-[#EAB308]"
          description={`${summary.resolvedComplaints} resolved`}
        />
        <StatsCard
          title="Total Budget"
          value={formatCurrency(summary.totalBudget)}
          icon={<DollarSign className="w-full h-full" />}
          iconBg="bg-[#DBEAFE]"
          iconColor="text-[#1E3A8A]"
          description={`${formatCurrency(summary.paidAmount)} disbursed`}
        />
        <StatsCard
          title="Pending Reviews"
          value={summary.pendingReviews}
          icon={<Clock className="w-full h-full" />}
          iconBg="bg-[#FEF9C3]"
          iconColor="text-[#EAB308]"
          description="Awaiting council/finance"
        />
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1 mb-6 bg-[#F1F5F9] p-1 rounded-lg w-fit">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-all ${
                activeTab === tab.id
                  ? "bg-white text-[#1E3A8A] shadow-sm"
                  : "text-[#64748B] hover:text-[#0F172A]"
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ── Overview Tab ──────────────────────────────────────── */}
      {activeTab === "overview" && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <BarChart
              title="Project Status Overview"
              data={projectStatusData}
            />
            <DonutChart
              title="PAP Compensation Status"
              data={papStatusData}
            />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <StatusBarChart
              title="Payment Progress"
              data={paymentStatusData}
            />
            <DonutChart
              title="Complaint Status"
              data={complaintStatusData}
            />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <MonthlyTrendsChart data={monthlyTrends} />
            <RecentActivity activities={recentActivity} />
          </div>
        </>
      )}

      {/* ── Financial Tab ──────────────────────────────────────── */}
      {activeTab === "financial" && (
        <>
          {/* Budget vs Actual Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
            <StatsCard
              title="Total Budget"
              value={formatCurrency(budgetAnalysis.totalBudget)}
              icon={<DollarSign className="w-full h-full" />}
              iconBg="bg-[#DBEAFE]"
              iconColor="text-[#1E3A8A]"
            />
            <StatsCard
              title="Total Compensation"
              value={formatCurrency(budgetAnalysis.totalCompensation)}
              icon={<DollarSign className="w-full h-full" />}
              iconBg="bg-[#CCFBF1]"
              iconColor="text-[#0F766E]"
            />
            <StatsCard
              title="Amount Paid"
              value={formatCurrency(budgetAnalysis.paidAmount)}
              icon={<DollarSign className="w-full h-full" />}
              iconBg="bg-[#DCFCE7]"
              iconColor="text-[#16A34A]"
            />
            <StatsCard
              title="Remaining Budget"
              value={formatCurrency(budgetAnalysis.remainingBudget)}
              icon={<DollarSign className="w-full h-full" />}
              iconBg="bg-[#FEF9C3]"
              iconColor="text-[#EAB308]"
              description={`${budgetAnalysis.paymentProgress}% disbursed`}
            />
          </div>

          {/* Budget Progress Bars */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle>Budget Utilization</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-[#0F172A]">Payment Progress</span>
                      <span className="text-sm font-bold text-[#1E3A8A]">{budgetAnalysis.paymentProgress}%</span>
                    </div>
                    <div className="w-full h-4 bg-[#F1F5F9] rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700 bg-[#16A34A]"
                        style={{ width: `${Math.min(budgetAnalysis.paymentProgress, 100)}%` }}
                      />
                    </div>
                    <div className="flex justify-between mt-1 text-xs text-[#94A3B8]">
                      <span>Paid: {formatCurrency(budgetAnalysis.paidAmount)}</span>
                      <span>Budget: {formatCurrency(budgetAnalysis.totalBudget)}</span>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-[#0F172A]">Compensation Progress</span>
                      <span className="text-sm font-bold text-[#1E3A8A]">{budgetAnalysis.compensationProgress}%</span>
                    </div>
                    <div className="w-full h-4 bg-[#F1F5F9] rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700 bg-[#F97316]"
                        style={{ width: `${Math.min(budgetAnalysis.compensationProgress, 100)}%` }}
                      />
                    </div>
                    <div className="flex justify-between mt-1 text-xs text-[#94A3B8]">
                      <span>Paid: {formatCurrency(budgetAnalysis.paidAmount)}</span>
                      <span>Compensation: {formatCurrency(budgetAnalysis.totalCompensation)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Financial Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-[#F8FAFC] rounded-lg">
                    <span className="text-sm text-[#64748B]">Total Budget</span>
                    <span className="text-sm font-semibold text-[#0F172A]">
                      {formatCurrency(budgetAnalysis.totalBudget)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-[#F8FAFC] rounded-lg">
                    <span className="text-sm text-[#64748B]">Total Compensation Value</span>
                    <span className="text-sm font-semibold text-[#0F172A]">
                      {formatCurrency(budgetAnalysis.totalCompensation)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-[#DCFCE7] rounded-lg">
                    <span className="text-sm font-medium text-[#16A34A]">Amount Paid</span>
                    <span className="text-sm font-semibold text-[#16A34A]">
                      {formatCurrency(budgetAnalysis.paidAmount)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-[#FEF9C3] rounded-lg">
                    <span className="text-sm font-medium text-[#EAB308]">Remaining Budget</span>
                    <span className="text-sm font-semibold text-[#EAB308]">
                      {formatCurrency(budgetAnalysis.remainingBudget)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Monthly Payment Trends */}
          <MonthlyTrendsChart data={monthlyTrends} />
        </>
      )}

      {/* ── Projects Tab ────────────────────────────────────────── */}
      {activeTab === "projects" && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <BarChart
              title="Project Status Distribution"
              data={projectStatusData}
            />
            <DonutChart
              title="Complaint Categories"
              data={complaintCategoryData}
            />
          </div>

          {/* Projects Table */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>All Projects</CardTitle>
                <span className="text-xs text-[#64748B]">{projectsData.length} total</span>
              </div>
            </CardHeader>
            <CardContent>
              {projectsData.length === 0 ? (
                <p className="text-sm text-[#64748B] text-center py-4">No projects found</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-[#E2E8F0]">
                        <th className="text-left py-3 px-2 font-medium text-[#64748B] text-xs uppercase tracking-wider">Name</th>
                        <th className="text-left py-3 px-2 font-medium text-[#64748B] text-xs uppercase tracking-wider">Location</th>
                        <th className="text-right py-3 px-2 font-medium text-[#64748B] text-xs uppercase tracking-wider">Budget</th>
                        <th className="text-center py-3 px-2 font-medium text-[#64748B] text-xs uppercase tracking-wider">Status</th>
                        <th className="text-left py-3 px-2 font-medium text-[#64748B] text-xs uppercase tracking-wider">Created</th>
                        <th className="text-left py-3 px-2 font-medium text-[#64748B] text-xs uppercase tracking-wider">Created By</th>
                      </tr>
                    </thead>
                    <tbody>
                      {projectsData.map((project) => {
                        const statusColors: Record<string, string> = {
                          ACTIVE: "bg-[#DBEAFE] text-[#1E3A8A]",
                          PENDING: "bg-[#FEF9C3] text-[#EAB308]",
                          COMPLETED: "bg-[#DCFCE7] text-[#16A34A]",
                          CANCELLED: "bg-[#F1F5F9] text-[#64748B]",
                        };
                        return (
                          <tr key={project.id} className="border-b border-[#F1F5F9] hover:bg-[#F8FAFC] transition-colors">
                            <td className="py-3 px-2 font-medium text-[#0F172A]">{project.name}</td>
                            <td className="py-3 px-2 text-[#64748B]">{project.location}</td>
                            <td className="py-3 px-2 text-right text-[#0F172A] font-medium">
                              {formatCurrency(project.budget)}
                            </td>
                            <td className="py-3 px-2 text-center">
                              <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-medium ${statusColors[project.status] || "bg-[#F1F5F9] text-[#64748B]"}`}>
                                {project.status}
                              </span>
                            </td>
                            <td className="py-3 px-2 text-[#64748B] text-xs">
                              {formatDate(project.createdAt)}
                            </td>
                            <td className="py-3 px-2 text-[#64748B] text-xs">
                              {project.createdBy.name}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </DashboardLayout>
  );
}

