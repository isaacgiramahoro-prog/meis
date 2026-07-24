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
  Clock,
} from "lucide-react";
import { useState, useEffect } from "react";

interface DashboardData {
  stats: {
    totalProjects: number;
    activePaps: number;
    completedPayments: number;
    pendingReviews: number;
    totalComplaints: number;
    resolvedComplaints: number;
    totalBudget: number;
    paidAmount: number;
  };
  projectStatusData: { label: string; value: number; color: string }[];
  papStatusData: { label: string; value: number; color: string }[];
  paymentStatusData: { label: string; value: number; color: string; bgColor: string }[];
  complaintStatusData: { label: string; value: number; color: string }[];
}

function LoadingSkeleton() {
  return (
    <DashboardLayout>
      <div className="mb-8">
        <div className="h-8 w-64 bg-[#E2E8F0] rounded-lg animate-pulse mb-2" />
        <div className="h-5 w-48 bg-[#E2E8F0] rounded animate-pulse" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
        {[...Array(4)].map((_, i) => (
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

export default function DashboardPage() {
  const { user } = useAuth();
  const role = user?.role || "VIEWER";
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        setError(null);
        const token = localStorage.getItem("token");
        const res = await fetch("/api/dashboard", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const json = await res.json();
        if (!res.ok || !json.success) {
          throw new Error(json.message || "Failed to load dashboard data");
        }
        setData(json.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An unexpected error occurred");
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) return <LoadingSkeleton />;

  // Default data when error or no data
  const stats = data?.stats ?? {
    totalProjects: 0,
    activePaps: 0,
    completedPayments: 0,
    pendingReviews: 0,
    totalComplaints: 0,
    resolvedComplaints: 0,
    totalBudget: 0,
    paidAmount: 0,
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

  const complaintData = data?.complaintStatusData ?? [
    { label: "Resolved", value: 0, color: "#16A34A" },
    { label: "Under Review", value: 0, color: "#EAB308" },
    { label: "Submitted", value: 0, color: "#F97316" },
    { label: "Rejected", value: 0, color: "#DC2626" },
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
            <Clock className="w-3.5 h-3.5" />
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
          data={paymentStatusData}
        />
        <DonutChart
          title="Complaint Status"
          data={complaintData}
        />
      </div>

    </DashboardLayout>
  );
}

