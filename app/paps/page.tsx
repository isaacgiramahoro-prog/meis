"use client";

import { useAuth } from "@/lib/context/AuthContext";
import DashboardLayout from "@/components/DashboardLayout";
import StatsCard from "@/components/StatsCard";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import {
  Users,
  UserCheck,
  DollarSign,
  FileText,
  Plus,
  Search,
  Loader2,
  ArrowUpDown,
} from "lucide-react";
import { CreatePapModal, type PapFormData } from "@/components/PapModals";

// --- Types ---
interface Pap {
  id: string;
  ownerName: string;
  ownerId: string;
  beneficiaryName: string;
  affectedUpi: string;
  affectedArea: number;
  propertyType: string;
  sector: string;
  cell: string;
  village: string;
  compensationStatus: string;
  compensationAmount: number | null;
  ownerSigned: boolean;
  cellSigned: boolean;
  sectorSigned: boolean;
  createdAt: string;
  updatedAt: string;
  projectId: string;
  project: {
    id: string;
    name: string;
    location: string;
  };
}

interface ProjectOption {
  id: string;
  name: string;
  location: string;
}

const statusConfig: Record<string, { label: string; variant: "info" | "warning" | "success" | "danger" | "secondary" }> = {
  DRAFT: { label: "Draft", variant: "secondary" },
  NOT_YET_PAID: { label: "Not Yet Paid", variant: "warning" },
  COUNCIL_REVIEW: { label: "Council Review", variant: "info" },
  FINANCE_PROCESSING: { label: "Finance Processing", variant: "info" },
  PAID: { label: "Paid", variant: "success" },
  FAILED: { label: "Failed", variant: "danger" },
  CANCELLED: { label: "Cancelled", variant: "danger" },
};

function formatCurrency(amount: number | null) {
  if (amount === null) return "—";
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

export default function PapsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const role = user?.role || "VIEWER";

  const [paps, setPaps] = useState<Pap[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [projects, setProjects] = useState<ProjectOption[]>([]);

  // --- Fetch PAPs ---
  const fetchPaps = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const params = new URLSearchParams();
      if (searchQuery) params.set("search", searchQuery);

      const res = await fetch(`/api/paps?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setPaps(data.data.paps);
      }
    } catch {
      // Silent fail
    } finally {
      setLoading(false);
    }
  }, [searchQuery]);

  useEffect(() => {
    fetchPaps();
  }, [fetchPaps]);

  // --- Fetch projects (for create modal) ---
  const fetchProjects = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/projects?limit=200", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setProjects(
          (data.data.projects || []).map((p: { id: string; name: string; location: string }) => ({
            id: p.id,
            name: p.name,
            location: p.location,
          }))
        );
      }
    } catch {
      // Silent fail
    }
  }, []);

  const handleOpenCreate = async () => {
    await fetchProjects();
    setShowCreateModal(true);
  };

  // --- Create PAP ---
  const handleCreatePap = async (data: PapFormData) => {
    const token = localStorage.getItem("token");
    const res = await fetch("/api/paps", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (!result.success) {
      const errorMsg = result.errors
        ? Object.values(result.errors).join(", ")
        : result.message;
      throw new Error(errorMsg);
    }
    await fetchPaps();
  };

  // --- Computed Stats ---
  const totalPaps = paps.length;
  const totalCompensation = paps.reduce(
    (sum, p) => sum + (p.compensationAmount || 0),
    0
  );
  const signedCount = paps.filter(
    (p) => p.ownerSigned && p.cellSigned && p.sectorSigned
  ).length;
  const paidCount = paps.filter(
    (p) => p.compensationStatus === "PAID"
  ).length;

  return (
    <DashboardLayout>
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A]">
            Project Affected Persons (PAPs)
          </h1>
          <p className="text-[#64748B] mt-1">
            Manage and track all registered project affected persons
          </p>
        </div>
        {role !== "VIEWER" && (
          <button
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#1E3A8A] text-white text-sm font-semibold rounded-lg hover:bg-[#1D4ED8] transition-colors"
          >
            <Plus className="w-4 h-4" />
            Register PAP
          </button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
        <StatsCard
          title="Total PAPs"
          value={totalPaps}
          icon={<Users className="w-full h-full" />}
          iconBg="bg-[#DBEAFE]"
          iconColor="text-[#1E3A8A]"
        />
        <StatsCard
          title="Fully Signed"
          value={signedCount}
          icon={<UserCheck className="w-full h-full" />}
          iconBg="bg-[#CCFBF1]"
          iconColor="text-[#0F766E]"
        />
        <StatsCard
          title="Total Compensation"
          value={formatCurrency(totalCompensation)}
          icon={<DollarSign className="w-full h-full" />}
          iconBg="bg-[#DCFCE7]"
          iconColor="text-[#16A34A]"
        />
        <StatsCard
          title="Paid"
          value={paidCount}
          icon={<FileText className="w-full h-full" />}
          iconBg="bg-[#FEF9C3]"
          iconColor="text-[#EAB308]"
        />
      </div>

      {/* Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
          <input
            type="text"
            placeholder="Search by owner, beneficiary, UPI..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-sm border border-[#CBD5E1] rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition-all placeholder:text-[#94A3B8]"
          />
        </div>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 text-[#1E3A8A] animate-spin" />
        </div>
      ) : paps.length > 0 ? (
        /* PAPs Table */
        <div className="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC]">
                  <th className="text-left px-4 py-3 font-semibold text-[#0F172A]">Owner</th>
                  <th className="text-left px-4 py-3 font-semibold text-[#0F172A]">Beneficiary</th>
                  <th className="text-left px-4 py-3 font-semibold text-[#0F172A]">UPI</th>
                  <th className="text-left px-4 py-3 font-semibold text-[#0F172A]">Location</th>
                  <th className="text-left px-4 py-3 font-semibold text-[#0F172A]">Area (m²)</th>
                  <th className="text-left px-4 py-3 font-semibold text-[#0F172A]">Compensation</th>
                  <th className="text-left px-4 py-3 font-semibold text-[#0F172A]">Status</th>
                  <th className="text-left px-4 py-3 font-semibold text-[#0F172A]">Project</th>
                  <th className="text-left px-4 py-3 font-semibold text-[#0F172A]">Signed</th>
                  <th className="text-left px-4 py-3 font-semibold text-[#0F172A]">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0]">
                {paps.map((pap) => {
                  const config = statusConfig[pap.compensationStatus] || {
                    label: pap.compensationStatus,
                    variant: "secondary" as const,
                  };
                  const allSigned = pap.ownerSigned && pap.cellSigned && pap.sectorSigned;

                  return (
                    <tr
                      key={pap.id}
                      className="hover:bg-[#F8FAFC] transition-colors cursor-pointer"
                      onClick={() => router.push(`/paps/${pap.id}`)}
                    >
                      <td className="px-4 py-3">
                        <p className="font-medium text-[#0F172A]">{pap.ownerName}</p>
                        <p className="text-xs text-[#64748B]">{pap.ownerId}</p>
                      </td>
                      <td className="px-4 py-3 text-[#0F172A]">{pap.beneficiaryName}</td>
                      <td className="px-4 py-3">
                        <code className="text-xs bg-[#F1F5F9] px-1.5 py-0.5 rounded text-[#1E3A8A]">
                          {pap.affectedUpi}
                        </code>
                      </td>
                      <td className="px-4 py-3 text-[#64748B]">
                        {pap.sector}, {pap.cell}
                      </td>
                      <td className="px-4 py-3 text-[#0F172A]">
                        {pap.affectedArea.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 font-medium text-[#0F172A]">
                        {formatCurrency(pap.compensationAmount)}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={config.variant}>{config.label}</Badge>
                      </td>
                      <td className="px-4 py-3 text-[#64748B] text-xs">
                        {pap.project.name}
                      </td>
                      <td className="px-4 py-3">
                        {allSigned ? (
                          <span className="inline-flex items-center gap-1 text-xs text-[#16A34A] font-medium">
                            <span className="w-1.5 h-1.5 bg-[#16A34A] rounded-full" />
                            All Signed
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs text-[#F59E0B] font-medium">
                            <span className="w-1.5 h-1.5 bg-[#F59E0B] rounded-full" />
                            Pending
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs text-[#64748B]">
                        {formatDate(pap.createdAt)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Empty State */
        <Card>
          <CardContent className="py-16 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-[#F1F5F9] rounded-2xl mb-4">
              <Users className="w-8 h-8 text-[#64748B]" />
            </div>
            <h3 className="text-lg font-semibold text-[#0F172A] mb-2">
              No PAPs registered yet
            </h3>
            <p className="text-sm text-[#64748B] max-w-sm mx-auto">
              {role !== "VIEWER"
                ? "Register your first Project Affected Person to get started."
                : "PAP records will appear here once they are registered."}
            </p>
            {role !== "VIEWER" && (
              <button
                onClick={handleOpenCreate}
                className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-[#1E3A8A] text-white text-sm font-semibold rounded-lg hover:bg-[#1D4ED8] transition-colors"
              >
                <Plus className="w-4 h-4" />
                Register PAP
              </button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Create PAP Modal */}
      <CreatePapModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreatePap}
        projects={projects}
      />
    </DashboardLayout>
  );
}

