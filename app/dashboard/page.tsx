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
  AlertTriangle,
  CheckCircle2,
  Clock,
  Plus,
  Eye,
} from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const { user } = useAuth();
  const role = user?.role || "VIEWER";

  // Mock data — will be replaced with API data
  const stats = {
    totalProjects: 3,
    activePaps: 24,
    completedPayments: 8,
    pendingReviews: 5,
    totalComplaints: 4,
    resolvedComplaints: 2,
    totalBudget: 450_000_000,
    paidAmount: 120_000_000,
  };

  const projectStatusData = [
    { label: "Active", value: 2, color: "#1E3A8A" },
    { label: "Pending", value: 1, color: "#EAB308" },
    { label: "Completed", value: 0, color: "#16A34A" },
    { label: "Cancelled", value: 0, color: "#6B7280" },
  ];

  const papStatusData = [
    { label: "Not Yet Paid", value: 10, color: "#DC2626" },
    { label: "Council Review", value: 5, color: "#EAB308" },
    { label: "Finance Processing", value: 4, color: "#F97316" },
    { label: "Paid", value: 8, color: "#16A34A" },
    { label: "Draft", value: 2, color: "#3B82F6" },
  ];

  const complaintData = [
    { label: "Resolved", value: 2, color: "#16A34A" },
    { label: "Under Review", value: 1, color: "#EAB308" },
    { label: "Submitted", value: 1, color: "#F97316" },
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-RW", {
      style: "currency",
      currency: "RWF",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <DashboardLayout>
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#0F172A]">
              Welcome, {user?.name?.split(" ")[0] || "User"}
            </h1>
            <p className="text-[#64748B] mt-1">
              You are logged in as{" "}
              <Badge variant={role === "ADMIN" ? "info" : role === "EDITOR" ? "warning" : "default"} className="ml-1">
                {role.toLowerCase()}
              </Badge>
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-sm text-[#64748B]">
            <Clock className="w-4 h-4" />
            <span>Last updated: Today</span>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
        <StatsCard
          title="Total Projects"
          value={stats.totalProjects}
          icon={<FolderKanban className="w-full h-full" />}
          iconBg="bg-[#DBEAFE]"
          iconColor="text-[#1E3A8A]"
          description="Active expropriation projects"
        />
        <StatsCard
          title="Active PAPs"
          value={stats.activePaps}
          icon={<Users className="w-full h-full" />}
          iconBg="bg-[#CCFBF1]"
          iconColor="text-[#0F766E]"
          description="Registered affected persons"
        />
        <StatsCard
          title="Completed Payments"
          value={stats.completedPayments}
          icon={<DollarSign className="w-full h-full" />}
          iconBg="bg-[#DCFCE7]"
          iconColor="text-[#16A34A]"
          description={`${formatCurrency(stats.paidAmount)} disbursed`}
        />
        <StatsCard
          title="Pending Reviews"
          value={stats.pendingReviews}
          icon={<FileText className="w-full h-full" />}
          iconBg="bg-[#FEF9C3]"
          iconColor="text-[#EAB308]"
          description="Awaiting council review"
        />
      </div>

      {/* Charts Row */}
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

      {/* Second Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <StatusBarChart
          title="Payment Progress"
          data={[
            { label: "Paid", value: 8, color: "#16A34A", bgColor: "#DCFCE7" },
            { label: "Pending", value: 10, color: "#DC2626", bgColor: "#FEE2E2" },
            { label: "Processing", value: 4, color: "#F97316", bgColor: "#FFEDD5" },
            { label: "Council Review", value: 5, color: "#EAB308", bgColor: "#FEF9C3" },
          ]}
        />
        <DonutChart
          title="Complaint Status"
          data={complaintData}
        />
      </div>

      {/* Quick Actions + Budget Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {(role === "ADMIN" || role === "EDITOR") && (
                <Link
                  href="/projects"
                  className="flex items-center gap-3 p-3 border border-[#E2E8F0] rounded-lg hover:bg-[#F8FAFC] hover:border-[#CBD5E1] transition-all text-left group"
                >
                  <div className="w-9 h-9 bg-[#DBEAFE] rounded-lg flex items-center justify-center group-hover:bg-[#BFDBFE] transition-colors">
                    <Plus className="w-4 h-4 text-[#1E3A8A]" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#0F172A]">New Project</p>
                    <p className="text-xs text-[#64748B]">Create a new project</p>
                  </div>
                </Link>
              )}
              {role === "EDITOR" && (
                <Link
                  href="/projects"
                  className="flex items-center gap-3 p-3 border border-[#E2E8F0] rounded-lg hover:bg-[#F8FAFC] hover:border-[#CBD5E1] transition-all text-left group"
                >
                  <div className="w-9 h-9 bg-[#CCFBF1] rounded-lg flex items-center justify-center group-hover:bg-[#A7F3D0] transition-colors">
                    <Users className="w-4 h-4 text-[#0F766E]" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#0F172A]">Register PAP</p>
                    <p className="text-xs text-[#64748B]">Add affected persons</p>
                  </div>
                </Link>
              )}
              <Link
                href="/projects"
                className="flex items-center gap-3 p-3 border border-[#E2E8F0] rounded-lg hover:bg-[#F8FAFC] hover:border-[#CBD5E1] transition-all text-left group"
              >
                <div className="w-9 h-9 bg-[#FFEDD5] rounded-lg flex items-center justify-center group-hover:bg-[#FED7AA] transition-colors">
                  <Eye className="w-4 h-4 text-[#F97316]" />
                </div>
                <div>
                  <p className="text-sm font-medium text-[#0F172A]">View Projects</p>
                  <p className="text-xs text-[#64748B]">Browse all projects</p>
                </div>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Budget Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Budget Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-[#64748B]">Total Budget</span>
                  <span className="text-sm font-semibold text-[#0F172A]">
                    {formatCurrency(stats.totalBudget)}
                  </span>
                </div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-[#64748B]">Disbursed</span>
                  <span className="text-sm font-semibold text-[#16A34A]">
                    {formatCurrency(stats.paidAmount)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#64748B]">Remaining</span>
                  <span className="text-sm font-semibold text-[#1E3A8A]">
                    {formatCurrency(stats.totalBudget - stats.paidAmount)}
                  </span>
                </div>
              </div>

              {/* Progress bar */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs text-[#64748B]">Disbursement Progress</span>
                  <span className="text-xs font-medium text-[#0F172A]">
                    {Math.round((stats.paidAmount / stats.totalBudget) * 100)}%
                  </span>
                </div>
                <div className="w-full h-2.5 bg-[#F1F5F9] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#16A34A] rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min((stats.paidAmount / stats.totalBudget) * 100, 100)}%`,
                    }}
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-[#E2E8F0]">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-[#EAB308] mt-0.5 shrink-0" />
                  <p className="text-xs text-[#64748B]">
                    {stats.pendingReviews > 0
                      ? `${stats.pendingReviews} PAPs are pending council review before payment can proceed.`
                      : "All PAPs have been processed for payment."}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

