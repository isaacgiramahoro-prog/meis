"use client";

import { useAuth } from "@/lib/context/AuthContext";
import DashboardLayout from "@/components/DashboardLayout";
import StatsCard from "@/components/StatsCard";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import {
  MessageSquare,
  AlertTriangle,
  Search,
  Loader2,
  Eye,
  FileCheck,
  XCircle,
  Clock,
  ArrowUpDown,
} from "lucide-react";
import { CreateComplaintModal, UpdateComplaintStatusModal, type CreateComplaintFormData, type UpdateComplaintFormData } from "@/components/ComplaintModals";

// --- Types ---
interface Complaint {
  id: string;
  category: string;
  description: string;
  status: string;
  resolution: string | null;
  resolvedAt: string | null;
  createdAt: string;
  updatedAt: string;
  parentComplaintId: string | null;
  pap: {
    id: string;
    ownerName: string;
    ownerId: string;
    beneficiaryName: string;
    affectedUpi: string;
    sector: string;
    cell: string;
  };
  project: {
    id: string;
    name: string;
    location: string;
  };
  resolvedBy: {
    id: string;
    name: string;
  } | null;
  parentComplaint: {
    id: string;
    category: string;
    status: string;
    description: string;
  } | null;
}

interface ComplaintStats {
  total: number;
  submitted: number;
  underReview: number;
  resolved: number;
  rejected: number;
}

const statusConfig: Record<string, { label: string; variant: "info" | "warning" | "success" | "danger" | "secondary" }> = {
  SUBMITTED: { label: "Submitted", variant: "info" },
  UNDER_REVIEW: { label: "Under Review", variant: "warning" },
  RESOLVED: { label: "Resolved", variant: "success" },
  REJECTED: { label: "Rejected", variant: "danger" },
};

const categoryLabels: Record<string, string> = {
  LAND_ISSUE: "Land Issue",
  VALUATION_ISSUE: "Valuation Issue",
  OWNERSHIP_ISSUE: "Ownership Issue",
  PAYMENT_ISSUE: "Payment Issue",
  OTHER: "Other",
};

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

export default function ComplaintsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const role = user?.role || "VIEWER";

  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [stats, setStats] = useState<ComplaintStats>({
    total: 0,
    submitted: 0,
    underReview: 0,
    resolved: 0,
    rejected: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [paps, setPaps] = useState<{ id: string; ownerName: string; projectId: string }[]>([]);

  // --- Fetch complaints ---
  const fetchComplaints = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const params = new URLSearchParams();
      if (searchQuery) params.set("search", searchQuery);
      if (statusFilter) params.set("status", statusFilter);

      const res = await fetch(`/api/complaints?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setComplaints(data.data.complaints);
        setStats(data.data.stats);
      }
    } catch {
      // Silent fail
    } finally {
      setLoading(false);
    }
  }, [searchQuery, statusFilter]);

  useEffect(() => {
    fetchComplaints();
  }, [fetchComplaints]);

  // --- Fetch PAPs (for create modal) ---
  const fetchPaps = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/paps?limit=500", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setPaps(
          (data.data.paps || []).map((p: { id: string; ownerName: string; projectId: string }) => ({
            id: p.id,
            ownerName: p.ownerName,
            projectId: p.projectId,
          }))
        );
      }
    } catch {
      // Silent fail
    }
  }, []);

  const handleOpenCreate = async () => {
    await fetchPaps();
    setShowCreateModal(true);
  };

  // --- Create complaint ---
  const handleCreateComplaint = async (data: CreateComplaintFormData) => {
    const token = localStorage.getItem("token");
    const res = await fetch("/api/complaints", {
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
    await fetchComplaints();
  };

  // --- Update complaint status ---
  const handleUpdateStatus = async (data: UpdateComplaintFormData) => {
    if (!selectedComplaint) return;
    const token = localStorage.getItem("token");
    const res = await fetch(`/api/complaints/${selectedComplaint.id}`, {
      method: "PATCH",
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
    setSelectedComplaint(null);
    await fetchComplaints();
  };

  const handleOpenUpdate = (complaint: Complaint) => {
    setSelectedComplaint(complaint);
    setShowUpdateModal(true);
  };

  return (
    <DashboardLayout>
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A]">
            Complaint Management
          </h1>
          <p className="text-[#64748B] mt-1">
            Track, manage and resolve PAP complaints and appeals
          </p>
        </div>
        {role !== "VIEWER" && (
          <button
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#1E3A8A] text-white text-sm font-semibold rounded-lg hover:bg-[#1D4ED8] transition-colors"
          >
            <MessageSquare className="w-4 h-4" />
            New Complaint
          </button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 lg:gap-6 mb-8">
        <StatsCard
          title="Total Complaints"
          value={stats.total}
          icon={<MessageSquare className="w-full h-full" />}
          iconBg="bg-[#DBEAFE]"
          iconColor="text-[#1E3A8A]"
        />
        <StatsCard
          title="Submitted"
          value={stats.submitted}
          icon={<Clock className="w-full h-full" />}
          iconBg="bg-[#F1F5F9]"
          iconColor="text-[#64748B]"
        />
        <StatsCard
          title="Under Review"
          value={stats.underReview}
          icon={<AlertTriangle className="w-full h-full" />}
          iconBg="bg-[#FEF9C3]"
          iconColor="text-[#EAB308]"
        />
        <StatsCard
          title="Resolved"
          value={stats.resolved}
          icon={<FileCheck className="w-full h-full" />}
          iconBg="bg-[#DCFCE7]"
          iconColor="text-[#16A34A]"
        />
        <StatsCard
          title="Rejected"
          value={stats.rejected}
          icon={<XCircle className="w-full h-full" />}
          iconBg="bg-[#FEE2E2]"
          iconColor="text-[#DC2626]"
        />
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
          <input
            type="text"
            placeholder="Search complaints, owner, beneficiary..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-sm border border-[#CBD5E1] rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition-all placeholder:text-[#94A3B8]"
          />
        </div>
        <div className="w-full sm:w-48">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2.5 text-sm border border-[#CBD5E1] rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition-all"
          >
            <option value="">All Statuses</option>
            <option value="SUBMITTED">Submitted</option>
            <option value="UNDER_REVIEW">Under Review</option>
            <option value="RESOLVED">Resolved</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 text-[#1E3A8A] animate-spin" />
        </div>
      ) : complaints.length > 0 ? (
        /* Complaints Table */
        <div className="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC]">
                  <th className="text-left px-4 py-3 font-semibold text-[#0F172A]">PAP Owner</th>
                  <th className="text-left px-4 py-3 font-semibold text-[#0F172A]">Category</th>
                  <th className="text-left px-4 py-3 font-semibold text-[#0F172A]">Description</th>
                  <th className="text-left px-4 py-3 font-semibold text-[#0F172A]">Status</th>
                  <th className="text-left px-4 py-3 font-semibold text-[#0F172A]">Project</th>
                  <th className="text-left px-4 py-3 font-semibold text-[#0F172A]">Appeal</th>
                  <th className="text-left px-4 py-3 font-semibold text-[#0F172A]">Date</th>
                  <th className="text-left px-4 py-3 font-semibold text-[#0F172A]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0]">
                {complaints.map((complaint) => {
                  const config = statusConfig[complaint.status] || {
                    label: complaint.status,
                    variant: "secondary" as const,
                  };

                  return (
                    <tr
                      key={complaint.id}
                      className="hover:bg-[#F8FAFC] transition-colors"
                    >
                      <td
                        className="px-4 py-3 cursor-pointer"
                        onClick={() => router.push(`/complaints/${complaint.id}`)}
                      >
                        <p className="font-medium text-[#0F172A]">{complaint.pap.ownerName}</p>
                        <p className="text-xs text-[#64748B]">{complaint.pap.ownerId}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs bg-[#F1F5F9] px-2 py-1 rounded text-[#64748B]">
                          {categoryLabels[complaint.category] || complaint.category}
                        </span>
                      </td>
                      <td
                        className="px-4 py-3 max-w-[200px] cursor-pointer"
                        onClick={() => router.push(`/complaints/${complaint.id}`)}
                      >
                        <p className="text-[#0F172A] truncate">{complaint.description}</p>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={config.variant}>{config.label}</Badge>
                      </td>
                      <td className="px-4 py-3 text-xs text-[#64748B]">
                        {complaint.project.name}
                      </td>
                      <td className="px-4 py-3">
                        {complaint.parentComplaint ? (
                          <Badge variant="warning">Appeal</Badge>
                        ) : (
                          <span className="text-xs text-[#94A3B8]">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs text-[#64748B]">
                        {formatDate(complaint.createdAt)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => router.push(`/complaints/${complaint.id}`)}
                            className="p-1.5 rounded-lg text-[#64748B] hover:bg-[#F1F5F9] transition-colors"
                            title="View details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {role !== "VIEWER" && complaint.status !== "RESOLVED" && complaint.status !== "REJECTED" && (
                            <button
                              onClick={() => handleOpenUpdate(complaint)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium bg-[#1E3A8A] text-white rounded-lg hover:bg-[#1D4ED8] transition-colors"
                            >
                              Update
                            </button>
                          )}
                        </div>
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
              <MessageSquare className="w-8 h-8 text-[#64748B]" />
            </div>
            <h3 className="text-lg font-semibold text-[#0F172A] mb-2">
              No complaints registered
            </h3>
            <p className="text-sm text-[#64748B] max-w-sm mx-auto">
              {role !== "VIEWER"
                ? "Register a new complaint to get started with tracking and resolution."
                : "Complaint records will appear here once they are registered."}
            </p>
            {role !== "VIEWER" && (
              <button
                onClick={handleOpenCreate}
                className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-[#1E3A8A] text-white text-sm font-semibold rounded-lg hover:bg-[#1D4ED8] transition-colors"
              >
                <MessageSquare className="w-4 h-4" />
                New Complaint
              </button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Create Complaint Modal */}
      <CreateComplaintModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateComplaint}
        papId=""
        projectId=""
        papOwnerName=""
      />

      {/* Update Complaint Status Modal */}
      {selectedComplaint && (
        <UpdateComplaintStatusModal
          isOpen={showUpdateModal}
          onClose={() => {
            setShowUpdateModal(false);
            setSelectedComplaint(null);
          }}
          onSubmit={handleUpdateStatus}
          currentStatus={selectedComplaint.status}
          complaintDescription={selectedComplaint.description}
          papOwnerName={selectedComplaint.pap.ownerName}
        />
      )}
    </DashboardLayout>
  );
}

