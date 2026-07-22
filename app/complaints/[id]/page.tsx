"use client";

import { useAuth } from "@/lib/context/AuthContext";
import DashboardLayout from "@/components/DashboardLayout";
import StatsCard from "@/components/StatsCard";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import {
  ArrowLeft,
  MessageSquare,
  AlertTriangle,
  FileCheck,
  XCircle,
  Clock,
  User,
  FolderKanban,
  Loader2,
  Scale,
  Calendar,
  Flag,
} from "lucide-react";
import {
  UpdateComplaintStatusModal,
  CreateComplaintModal,
  type UpdateComplaintFormData,
  type CreateComplaintFormData,
} from "@/components/ComplaintModals";

// --- Types ---
interface ComplaintDetail {
  id: string;
  category: string;
  description: string;
  status: string;
  resolution: string | null;
  resolvedAt: string | null;
  parentComplaintId: string | null;
  createdAt: string;
  updatedAt: string;
  pap: {
    id: string;
    ownerName: string;
    ownerId: string;
    ownerPhone: string | null;
    ownerEmail: string | null;
    beneficiaryName: string;
    beneficiaryId: string;
    beneficiaryPhone: string | null;
    beneficiaryEmail: string | null;
    affectedUpi: string;
    affectedArea: number;
    propertyType: string;
    sector: string;
    cell: string;
    village: string;
    compensationStatus: string;
    compensationAmount: number | null;
  };
  project: {
    id: string;
    name: string;
    location: string;
    status: string;
  };
  resolvedBy: {
    id: string;
    name: string;
    email: string;
  } | null;
  parentComplaint: {
    id: string;
    category: string;
    status: string;
    description: string;
    resolvedAt: string | null;
    resolution: string | null;
    pap: { id: string; ownerName: string };
  } | null;
  childComplaints: {
    id: string;
    category: string;
    description: string;
    status: string;
    createdAt: string;
    resolvedAt: string | null;
    resolution: string | null;
    pap: { id: string; ownerName: string };
    resolvedBy: { id: string; name: string } | null;
  }[];
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

function formatDate(dateStr: string | null) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
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

function formatCurrency(amount: number | null) {
  if (amount === null) return "—";
  return new Intl.NumberFormat("en-RW", {
    style: "currency",
    currency: "RWF",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function ComplaintDetailPage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const role = user?.role || "VIEWER";
  const complaintId = params.id as string;

  const [complaint, setComplaint] = useState<ComplaintDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showAppealModal, setShowAppealModal] = useState(false);

  const fetchComplaint = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/complaints/${complaintId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setComplaint(data.data.complaint);
      } else {
        setError(data.message || "Complaint not found");
      }
    } catch {
      setError("Failed to load complaint details");
    } finally {
      setLoading(false);
    }
  }, [complaintId]);

  useEffect(() => {
    fetchComplaint();
  }, [fetchComplaint]);

  // --- Update status ---
  const handleUpdateStatus = async (data: UpdateComplaintFormData) => {
    const token = localStorage.getItem("token");
    const res = await fetch(`/api/complaints/${complaintId}`, {
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
    await fetchComplaint();
  };

  // --- Create appeal ---
  const handleCreateAppeal = async (data: CreateComplaintFormData) => {
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
    await fetchComplaint();
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-8 h-8 text-[#1E3A8A] animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  if (error || !complaint) {
    return (
      <DashboardLayout>
        <div className="text-center py-24">
          <p className="text-[#DC2626] text-lg font-medium mb-4">{error || "Complaint not found"}</p>
          <button
            onClick={() => router.push("/complaints")}
            className="inline-flex items-center gap-2 text-sm text-[#1E3A8A] hover:text-[#1D4ED8] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Complaints
          </button>
        </div>
      </DashboardLayout>
    );
  }

  const config = statusConfig[complaint.status] || {
    label: complaint.status,
    variant: "secondary" as const,
  };

  return (
    <DashboardLayout>
      {/* Back button */}
      <button
        onClick={() => router.push("/complaints")}
        className="inline-flex items-center gap-2 text-sm text-[#64748B] hover:text-[#1E3A8A] transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Complaints
      </button>

      {/* Complaint Header */}
      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6 mb-8">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-bold text-[#0F172A]">Complaint Details</h1>
            <Badge variant={config.variant} className="text-sm px-3 py-1">
              {config.label}
            </Badge>
            {complaint.parentComplaintId && (
              <Badge variant="warning">Appeal</Badge>
            )}
          </div>
          <div className="flex items-center gap-4 text-sm text-[#64748B]">
            <span className="flex items-center gap-1">
              <User className="w-4 h-4" />
              {complaint.pap.ownerName}
            </span>
            <span className="flex items-center gap-1">
              <FolderKanban className="w-4 h-4" />
              {complaint.project.name}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {formatDate(complaint.createdAt)}
            </span>
          </div>
        </div>

        {/* Actions */}
        {role !== "VIEWER" && (
          <div className="flex items-center gap-2 shrink-0">
            {complaint.status !== "RESOLVED" && complaint.status !== "REJECTED" && (
              <button
                onClick={() => setShowUpdateModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#1E3A8A] text-white text-sm font-semibold rounded-lg hover:bg-[#1D4ED8] transition-colors"
              >
                <AlertTriangle className="w-4 h-4" />
                Update Status
              </button>
            )}
            {complaint.status === "RESOLVED" && (
              <button
                onClick={() => setShowAppealModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#DC2626] text-white text-sm font-semibold rounded-lg hover:bg-[#B91C1C] transition-colors"
              >
                <Flag className="w-4 h-4" />
                File Appeal
              </button>
            )}
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
        <StatsCard
          title="Category"
          value={categoryLabels[complaint.category] || complaint.category}
          icon={<MessageSquare className="w-full h-full" />}
          iconBg="bg-[#DBEAFE]"
          iconColor="text-[#1E3A8A]"
        />
        <StatsCard
          title="Status"
          value={config.label}
          icon={<Clock className="w-full h-full" />}
          iconBg="bg-[#F1F5F9]"
          iconColor="text-[#64748B]"
        />
        <StatsCard
          title="Resolved By"
          value={complaint.resolvedBy?.name || "—"}
          icon={<User className="w-full h-full" />}
          iconBg="bg-[#CCFBF1]"
          iconColor="text-[#0F766E]"
        />
        <StatsCard
          title="Resolution Date"
          value={formatDate(complaint.resolvedAt)}
          icon={<Calendar className="w-full h-full" />}
          iconBg="bg-[#FEF9C3]"
          iconColor="text-[#EAB308]"
        />
      </div>

      {/* Complaint Description Card */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-base font-semibold text-[#0F172A] flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-[#64748B]" />
            Complaint Description
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-[#0F172A] whitespace-pre-wrap">{complaint.description}</p>
        </CardContent>
      </Card>

      {/* Resolution Card (if resolved/rejected) */}
      {(complaint.status === "RESOLVED" || complaint.status === "REJECTED") && complaint.resolution && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-[#0F172A] flex items-center gap-2">
              {complaint.status === "RESOLVED" ? (
                <FileCheck className="w-4 h-4 text-[#16A34A]" />
              ) : (
                <XCircle className="w-4 h-4 text-[#DC2626]" />
              )}
              {complaint.status === "RESOLVED" ? "Resolution" : "Rejection Reason"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-[#0F172A] whitespace-pre-wrap">{complaint.resolution}</p>
            {complaint.resolvedBy && (
              <p className="text-xs text-[#64748B] mt-3">
                {complaint.status === "RESOLVED" ? "Resolved" : "Rejected"} by {complaint.resolvedBy.name} on{" "}
                {formatDate(complaint.resolvedAt)}
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Linked PAP Information */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-base font-semibold text-[#0F172A] flex items-center gap-2">
            <User className="w-4 h-4 text-[#64748B]" />
            Related PAP Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <p className="text-xs font-medium text-[#64748B] uppercase tracking-wider">Owner Name</p>
              <p className="mt-1 text-sm text-[#0F172A] font-medium">{complaint.pap.ownerName}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-[#64748B] uppercase tracking-wider">Owner ID</p>
              <p className="mt-1 text-sm text-[#0F172A]">{complaint.pap.ownerId}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-[#64748B] uppercase tracking-wider">Compensation Status</p>
              <div className="mt-1">
                <Badge variant="info">{complaint.pap.compensationStatus}</Badge>
              </div>
            </div>
            <div>
              <p className="text-xs font-medium text-[#64748B] uppercase tracking-wider">Compensation Amount</p>
              <p className="mt-1 text-sm text-[#0F172A] font-semibold">
                {formatCurrency(complaint.pap.compensationAmount)}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-[#64748B] uppercase tracking-wider">Location</p>
              <p className="mt-1 text-sm text-[#0F172A]">
                {complaint.pap.sector}, {complaint.pap.cell}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-[#64748B] uppercase tracking-wider">Affected UPI</p>
              <p className="mt-1 text-sm font-mono text-[#1E3A8A]">{complaint.pap.affectedUpi}</p>
            </div>
          </div>
          <div className="mt-4">
            <button
              onClick={() => router.push(`/paps/${complaint.pap.id}`)}
              className="text-sm text-[#1E3A8A] hover:text-[#1D4ED8] font-medium transition-colors"
            >
              View full PAP details →
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Parent Complaint (if this is an appeal) */}
      {complaint.parentComplaint && (
        <Card className="mb-6 border-[#FDE68A]">
          <CardHeader className="bg-[#FEF9C3]">
            <CardTitle className="text-base font-semibold text-[#0F172A] flex items-center gap-2">
              <Flag className="w-4 h-4 text-[#EAB308]" />
              Parent Complaint (This is an Appeal)
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-[#64748B] uppercase">Status:</span>
                <Badge variant={statusConfig[complaint.parentComplaint.status]?.variant || "secondary"}>
                  {statusConfig[complaint.parentComplaint.status]?.label}
                </Badge>
              </div>
              <p className="text-sm text-[#0F172A]">
                <span className="font-medium">Description:</span> {complaint.parentComplaint.description}
              </p>
              {complaint.parentComplaint.resolution && (
                <p className="text-sm text-[#0F172A]">
                  <span className="font-medium">Resolution:</span> {complaint.parentComplaint.resolution}
                </p>
              )}
              <button
                onClick={() => router.push(`/complaints/${complaint.parentComplaint!.id}`)}
                className="text-sm text-[#1E3A8A] hover:text-[#1D4ED8] font-medium transition-colors"
              >
                View parent complaint →
              </button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Child Complaints (Appeals filed against this complaint) */}
      {complaint.childComplaints.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-[#0F172A] flex items-center gap-2">
              <Flag className="w-4 h-4 text-[#64748B]" />
              Appeals ({complaint.childComplaints.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {complaint.childComplaints.map((child) => {
                const childConfig = statusConfig[child.status] || {
                  label: child.status,
                  variant: "secondary" as const,
                };
                return (
                  <div
                    key={child.id}
                    className="p-4 border border-[#E2E8F0] rounded-lg hover:bg-[#F8FAFC] transition-colors cursor-pointer"
                    onClick={() => router.push(`/complaints/${child.id}`)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs bg-[#F1F5F9] px-2 py-1 rounded text-[#64748B]">
                        {categoryLabels[child.category] || child.category}
                      </span>
                      <Badge variant={childConfig.variant}>{childConfig.label}</Badge>
                    </div>
                    <p className="text-sm text-[#0F172A] line-clamp-2">{child.description}</p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-[#64748B]">
                      <span>{formatDate(child.createdAt)}</span>
                      {child.resolvedBy && <span>By: {child.resolvedBy.name}</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Timestamps */}
      <div className="text-xs text-[#94A3B8] text-right">
        Created: {formatDateTime(complaint.createdAt)} | Last updated: {formatDateTime(complaint.updatedAt)}
      </div>

      {/* Update Status Modal */}
      <UpdateComplaintStatusModal
        isOpen={showUpdateModal}
        onClose={() => setShowUpdateModal(false)}
        onSubmit={handleUpdateStatus}
        currentStatus={complaint.status}
        complaintDescription={complaint.description}
        papOwnerName={complaint.pap.ownerName}
      />

      {/* Appeal Modal */}
      <CreateComplaintModal
        isOpen={showAppealModal}
        onClose={() => setShowAppealModal(false)}
        onSubmit={handleCreateAppeal}
        papId={complaint.pap.id}
        projectId={complaint.project.id}
        papOwnerName={complaint.pap.ownerName}
        parentComplaintId={complaint.id}
      />
    </DashboardLayout>
  );
}

