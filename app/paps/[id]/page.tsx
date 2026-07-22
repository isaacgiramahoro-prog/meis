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
  DollarSign,
  FileText,
  UserCheck,
  MapPin,
  Calendar,
  User,
  Scale,
  LandPlot,
  Banknote,
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
  Pencil,
  FolderKanban,
} from "lucide-react";
import { ValuationModal } from "@/components/PapModals";

// --- Types ---
interface PapDetail {
  id: string;
  createdAt: string;
  updatedAt: string;
  projectId: string;
  ownerName: string;
  ownerId: string;
  ownerPhone: string | null;
  ownerEmail: string | null;
  civilStatus: string | null;
  beneficiaryName: string;
  beneficiaryId: string;
  beneficiaryPhone: string | null;
  beneficiaryEmail: string | null;
  relationship: string | null;
  affectedUpi: string;
  affectedArea: number;
  propertyType: string;
  sector: string;
  cell: string;
  village: string;
  landRegistration: string | null;
  landDescription: string | null;
  compensationStatus: string;
  compensationAmount: number | null;
  valuationDate: string | null;
  valuationComment: string | null;
  ownerSigned: boolean;
  ownerSignedDate: string | null;
  cellSigned: boolean;
  cellSignedDate: string | null;
  sectorSigned: boolean;
  sectorSignedDate: string | null;
  landVerified: boolean;
  landVerifiedBy: string | null;
  landVerifiedDate: string | null;
  landTitleVerified: boolean;
  landTitleVerifiedBy: string | null;
  landTitleVerifiedDate: string | null;
  idVerified: boolean;
  idVerifiedBy: string | null;
  idVerifiedDate: string | null;
  bankName: string | null;
  accountNumber: string | null;
  paymentCode: string | null;
  paidAmount: number | null;
  paidDate: string | null;
  project: {
    id: string;
    name: string;
    location: string;
    assignedEditorId: string | null;
  };
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

export default function PapDetailPage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const role = user?.role || "VIEWER";
  const papId = params.id as string;

  const [pap, setPap] = useState<PapDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showValuationModal, setShowValuationModal] = useState(false);

  const fetchPap = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/paps/${papId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setPap(data.data.pap);
      } else {
        setError(data.message || "PAP not found");
      }
    } catch {
      setError("Failed to load PAP details");
    } finally {
      setLoading(false);
    }
  }, [papId]);

  useEffect(() => {
    fetchPap();
  }, [fetchPap]);

  // --- Approve a signature ---
  const handleApprove = async (field: string, dateField: string) => {
    const token = localStorage.getItem("token");
    const res = await fetch(`/api/paps/${papId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        [field]: true,
        [dateField]: new Date().toISOString(),
      }),
    });
    const result = await res.json();
    if (!result.success) {
      const errorMsg = result.errors
        ? Object.values(result.errors).join(", ")
        : result.message;
      throw new Error(errorMsg);
    }
    await fetchPap();
  };

  // --- Update Valuation ---
  const handleUpdateValuation = async (data: {
    compensationAmount?: number | null;
    valuationDate?: string | null;
    valuationComment?: string | null;
    compensationStatus?: string;
  }) => {
    const token = localStorage.getItem("token");
    const res = await fetch(`/api/paps/${papId}`, {
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
    await fetchPap();
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

  if (error || !pap) {
    return (
      <DashboardLayout>
        <div className="text-center py-24">
          <p className="text-[#DC2626] text-lg font-medium mb-4">{error || "PAP not found"}</p>
          <button
            onClick={() => router.push("/paps")}
            className="inline-flex items-center gap-2 text-sm text-[#1E3A8A] hover:text-[#1D4ED8] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to PAPs
          </button>
        </div>
      </DashboardLayout>
    );
  }

  const config = statusConfig[pap.compensationStatus] || {
    label: pap.compensationStatus,
    variant: "secondary" as const,
  };
  const allSigned = pap.ownerSigned && pap.cellSigned && pap.sectorSigned;

  return (
    <DashboardLayout>
      {/* Back button */}
      <button
        onClick={() => router.push("/paps")}
        className="inline-flex items-center gap-2 text-sm text-[#64748B] hover:text-[#1E3A8A] transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to PAPs
      </button>

      {/* PAP Header */}
      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6 mb-8">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-bold text-[#0F172A]">{pap.ownerName}</h1>
            <Badge variant={config.variant} className="text-sm px-3 py-1">
              {config.label}
            </Badge>
          </div>
          <div className="flex items-center gap-4 text-sm text-[#64748B]">
            <span className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              {pap.sector}, {pap.cell}
            </span>
            <span className="flex items-center gap-1">
              <FolderKanban className="w-4 h-4" />
              {pap.project.name}
            </span>
          </div>
        </div>

        {/* Actions */}
        {role !== "VIEWER" && (
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setShowValuationModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#1E3A8A] text-white text-sm font-semibold rounded-lg hover:bg-[#1D4ED8] transition-colors"
            >
              <Pencil className="w-4 h-4" />
              Update Valuation
            </button>
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
        <StatsCard
          title="Compensation Amount"
          value={formatCurrency(pap.compensationAmount)}
          icon={<DollarSign className="w-full h-full" />}
          iconBg="bg-[#DCFCE7]"
          iconColor="text-[#16A34A]"
        />
        <StatsCard
          title="Compensation Status"
          value={config.label}
          icon={<FileText className="w-full h-full" />}
          iconBg="bg-[#DBEAFE]"
          iconColor="text-[#1E3A8A]"
        />
        <StatsCard
          title="All Signatures"
          value={allSigned ? "Complete" : "Pending"}
          icon={<UserCheck className="w-full h-full" />}
          iconBg="bg-[#CCFBF1]"
          iconColor="text-[#0F766E]"
          description={allSigned ? "Owner, Cell & Sector" : "Not all signed yet"}
        />
        <StatsCard
          title="Valuation Date"
          value={formatDate(pap.valuationDate)}
          icon={<Calendar className="w-full h-full" />}
          iconBg="bg-[#FEF9C3]"
          iconColor="text-[#EAB308]"
        />
      </div>

      {/* Valuation Section */}
      <Card className="mb-6">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base font-semibold text-[#0F172A]">
            Valuation & Compensation Details
          </CardTitle>
          {role !== "VIEWER" && (
            <button
              onClick={() => setShowValuationModal(true)}
              className="inline-flex items-center gap-1.5 text-sm text-[#1E3A8A] hover:text-[#1D4ED8] font-medium transition-colors"
            >
              <Pencil className="w-3.5 h-3.5" />
              Edit
            </button>
          )}
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <p className="text-xs font-medium text-[#64748B] uppercase tracking-wider">Compensation Amount</p>
              <p className="mt-1 text-lg font-bold text-[#0F172A]">
                {formatCurrency(pap.compensationAmount)}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-[#64748B] uppercase tracking-wider">Status</p>
              <div className="mt-1">
                <Badge variant={config.variant}>{config.label}</Badge>
              </div>
            </div>
            <div>
              <p className="text-xs font-medium text-[#64748B] uppercase tracking-wider">Valuation Date</p>
              <p className="mt-1 text-sm text-[#0F172A]">{formatDate(pap.valuationDate)}</p>
            </div>
            <div className="md:col-span-2 lg:col-span-3">
              <p className="text-xs font-medium text-[#64748B] uppercase tracking-wider">Valuation Comment</p>
              <p className="mt-1 text-sm text-[#64748B]">
                {pap.valuationComment || "No comment provided"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Two-column layout for remaining sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Owner Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold text-[#0F172A] flex items-center gap-2">
              <User className="w-4 h-4 text-[#64748B]" />
              Owner Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-medium text-[#64748B] uppercase tracking-wider">Name</p>
                  <p className="mt-1 text-sm text-[#0F172A] font-medium">{pap.ownerName}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-[#64748B] uppercase tracking-wider">National ID</p>
                  <p className="mt-1 text-sm text-[#0F172A]">{pap.ownerId}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-[#64748B] uppercase tracking-wider">Phone</p>
                  <p className="mt-1 text-sm text-[#0F172A]">{pap.ownerPhone || "—"}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-[#64748B] uppercase tracking-wider">Email</p>
                  <p className="mt-1 text-sm text-[#0F172A]">{pap.ownerEmail || "—"}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-[#64748B] uppercase tracking-wider">Civil Status</p>
                  <p className="mt-1 text-sm text-[#0F172A]">{pap.civilStatus || "—"}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Beneficiary Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold text-[#0F172A] flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-[#64748B]" />
              Beneficiary Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-medium text-[#64748B] uppercase tracking-wider">Name</p>
                  <p className="mt-1 text-sm text-[#0F172A] font-medium">{pap.beneficiaryName}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-[#64748B] uppercase tracking-wider">National ID</p>
                  <p className="mt-1 text-sm text-[#0F172A]">{pap.beneficiaryId}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-[#64748B] uppercase tracking-wider">Phone</p>
                  <p className="mt-1 text-sm text-[#0F172A]">{pap.beneficiaryPhone || "—"}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-[#64748B] uppercase tracking-wider">Email</p>
                  <p className="mt-1 text-sm text-[#0F172A]">{pap.beneficiaryEmail || "—"}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-[#64748B] uppercase tracking-wider">Relationship to Owner</p>
                  <p className="mt-1 text-sm text-[#0F172A]">{pap.relationship || "—"}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Land Information */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-base font-semibold text-[#0F172A] flex items-center gap-2">
            <LandPlot className="w-4 h-4 text-[#64748B]" />
            Land Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <p className="text-xs font-medium text-[#64748B] uppercase tracking-wider">UPI</p>
              <p className="mt-1 text-sm text-[#0F172A] font-mono">{pap.affectedUpi}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-[#64748B] uppercase tracking-wider">Affected Area</p>
              <p className="mt-1 text-sm text-[#0F172A]">{pap.affectedArea.toLocaleString()} m²</p>
            </div>
            <div>
              <p className="text-xs font-medium text-[#64748B] uppercase tracking-wider">Property Type</p>
              <p className="mt-1 text-sm text-[#0F172A] capitalize">{pap.propertyType.toLowerCase()}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-[#64748B] uppercase tracking-wider">Sector</p>
              <p className="mt-1 text-sm text-[#0F172A]">{pap.sector}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-[#64748B] uppercase tracking-wider">Cell</p>
              <p className="mt-1 text-sm text-[#0F172A]">{pap.cell}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-[#64748B] uppercase tracking-wider">Village</p>
              <p className="mt-1 text-sm text-[#0F172A]">{pap.village}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-[#64748B] uppercase tracking-wider">Land Registration</p>
              <p className="mt-1 text-sm text-[#0F172A]">{pap.landRegistration || "—"}</p>
            </div>
            <div className="md:col-span-2">
              <p className="text-xs font-medium text-[#64748B] uppercase tracking-wider">Description</p>
              <p className="mt-1 text-sm text-[#64748B]">{pap.landDescription || "No description"}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Signatures Section */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-base font-semibold text-[#0F172A] flex items-center gap-2">
            <Scale className="w-4 h-4 text-[#64748B]" />
            Approval Signatures
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Owner Signed */}
            <div className={`p-4 rounded-lg border flex flex-col ${pap.ownerSigned ? "bg-[#F0FDF4] border-[#BBF7D0]" : "bg-[#FEF9C3] border-[#FDE68A]"}`}>
              <div className="flex items-center gap-2 mb-2">
                {pap.ownerSigned ? (
                  <CheckCircle2 className="w-5 h-5 text-[#16A34A]" />
                ) : (
                  <XCircle className="w-5 h-5 text-[#EAB308]" />
                )}
                <span className="font-medium text-sm text-[#0F172A]">Owner Signed</span>
              </div>
              <p className="text-xs text-[#64748B] mb-3">
                {pap.ownerSignedDate ? formatDate(pap.ownerSignedDate) : "Not signed"}
              </p>
              {role !== "VIEWER" && !pap.ownerSigned && (
                <button
                  onClick={() => handleApprove("ownerSigned", "ownerSignedDate")}
                  className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-[#1E3A8A] text-white rounded-md hover:bg-[#1D4ED8] transition-colors mt-auto"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Approve as Owner
                </button>
              )}
              {pap.ownerSigned && (
                <span className="inline-flex items-center gap-1 text-xs font-medium text-[#16A34A] mt-auto">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Approved
                </span>
              )}
            </div>

            {/* Cell Signed */}
            <div className={`p-4 rounded-lg border flex flex-col ${pap.cellSigned ? "bg-[#F0FDF4] border-[#BBF7D0]" : "bg-[#FEF9C3] border-[#FDE68A]"}`}>
              <div className="flex items-center gap-2 mb-2">
                {pap.cellSigned ? (
                  <CheckCircle2 className="w-5 h-5 text-[#16A34A]" />
                ) : (
                  <XCircle className="w-5 h-5 text-[#EAB308]" />
                )}
                <span className="font-medium text-sm text-[#0F172A]">Cell Signed</span>
              </div>
              <p className="text-xs text-[#64748B] mb-3">
                {pap.cellSignedDate ? formatDate(pap.cellSignedDate) : "Not signed"}
              </p>
              {role !== "VIEWER" && !pap.cellSigned && (
                <button
                  onClick={() => handleApprove("cellSigned", "cellSignedDate")}
                  className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-[#1E3A8A] text-white rounded-md hover:bg-[#1D4ED8] transition-colors mt-auto"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Approve as Cell
                </button>
              )}
              {pap.cellSigned && (
                <span className="inline-flex items-center gap-1 text-xs font-medium text-[#16A34A] mt-auto">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Approved
                </span>
              )}
            </div>

            {/* Sector Signed */}
            <div className={`p-4 rounded-lg border flex flex-col ${pap.sectorSigned ? "bg-[#F0FDF4] border-[#BBF7D0]" : "bg-[#FEF9C3] border-[#FDE68A]"}`}>
              <div className="flex items-center gap-2 mb-2">
                {pap.sectorSigned ? (
                  <CheckCircle2 className="w-5 h-5 text-[#16A34A]" />
                ) : (
                  <XCircle className="w-5 h-5 text-[#EAB308]" />
                )}
                <span className="font-medium text-sm text-[#0F172A]">Sector Signed</span>
              </div>
              <p className="text-xs text-[#64748B] mb-3">
                {pap.sectorSignedDate ? formatDate(pap.sectorSignedDate) : "Not signed"}
              </p>
              {role !== "VIEWER" && !pap.sectorSigned && (
                <button
                  onClick={() => handleApprove("sectorSigned", "sectorSignedDate")}
                  className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-[#1E3A8A] text-white rounded-md hover:bg-[#1D4ED8] transition-colors mt-auto"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Approve as Sector
                </button>
              )}
              {pap.sectorSigned && (
                <span className="inline-flex items-center gap-1 text-xs font-medium text-[#16A34A] mt-auto">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Approved
                </span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Verification Section */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-base font-semibold text-[#0F172A] flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#64748B]" />
            Verification Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Land Verified */}
            <div className={`p-4 rounded-lg border flex flex-col items-start gap-2 ${pap.landVerified ? "bg-[#F0FDF4] border-[#BBF7D0]" : "bg-[#FEF9C3] border-[#FDE68A]"}`}>
              <div className="flex items-center gap-2">
                {pap.landVerified ? (
                  <CheckCircle2 className="w-4 h-4 text-[#16A34A]" />
                ) : (
                  <Clock className="w-4 h-4 text-[#EAB308]" />
                )}
                <span className="text-sm font-medium text-[#0F172A]">Land Verified</span>
              </div>
              <p className="text-xs text-[#64748B]">
                {pap.landVerified
                  ? `By ${pap.landVerifiedBy || "Unknown"} on ${formatDate(pap.landVerifiedDate)}`
                  : "Not verified"}
              </p>
              {role !== "VIEWER" && !pap.landVerified && (
                <button
                  onClick={() => handleApprove("landVerified", "landVerifiedDate")}
                  className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-[#1E3A8A] text-white rounded-md hover:bg-[#1D4ED8] transition-colors mt-1"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Verify Land
                </button>
              )}
              {pap.landVerified && (
                <span className="inline-flex items-center gap-1 text-xs font-medium text-[#16A34A]">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Verified
                </span>
              )}
            </div>

            {/* Land Title Verified */}
            <div className={`p-4 rounded-lg border flex flex-col items-start gap-2 ${pap.landTitleVerified ? "bg-[#F0FDF4] border-[#BBF7D0]" : "bg-[#FEF9C3] border-[#FDE68A]"}`}>
              <div className="flex items-center gap-2">
                {pap.landTitleVerified ? (
                  <CheckCircle2 className="w-4 h-4 text-[#16A34A]" />
                ) : (
                  <Clock className="w-4 h-4 text-[#EAB308]" />
                )}
                <span className="text-sm font-medium text-[#0F172A]">Land Title Verified</span>
              </div>
              <p className="text-xs text-[#64748B]">
                {pap.landTitleVerified
                  ? `By ${pap.landTitleVerifiedBy || "Unknown"} on ${formatDate(pap.landTitleVerifiedDate)}`
                  : "Not verified"}
              </p>
              {role !== "VIEWER" && !pap.landTitleVerified && (
                <button
                  onClick={() => handleApprove("landTitleVerified", "landTitleVerifiedDate")}
                  className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-[#1E3A8A] text-white rounded-md hover:bg-[#1D4ED8] transition-colors mt-1"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Verify Title
                </button>
              )}
              {pap.landTitleVerified && (
                <span className="inline-flex items-center gap-1 text-xs font-medium text-[#16A34A]">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Verified
                </span>
              )}
            </div>

            {/* ID Verified */}
            <div className={`p-4 rounded-lg border flex flex-col items-start gap-2 ${pap.idVerified ? "bg-[#F0FDF4] border-[#BBF7D0]" : "bg-[#FEF9C3] border-[#FDE68A]"}`}>
              <div className="flex items-center gap-2">
                {pap.idVerified ? (
                  <CheckCircle2 className="w-4 h-4 text-[#16A34A]" />
                ) : (
                  <Clock className="w-4 h-4 text-[#EAB308]" />
                )}
                <span className="text-sm font-medium text-[#0F172A]">ID Verified</span>
              </div>
              <p className="text-xs text-[#64748B]">
                {pap.idVerified
                  ? `By ${pap.idVerifiedBy || "Unknown"} on ${formatDate(pap.idVerifiedDate)}`
                  : "Not verified"}
              </p>
              {role !== "VIEWER" && !pap.idVerified && (
                <button
                  onClick={() => handleApprove("idVerified", "idVerifiedDate")}
                  className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-[#1E3A8A] text-white rounded-md hover:bg-[#1D4ED8] transition-colors mt-1"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Verify ID
                </button>
              )}
              {pap.idVerified && (
                <span className="inline-flex items-center gap-1 text-xs font-medium text-[#16A34A]">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Verified
                </span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Information */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-base font-semibold text-[#0F172A] flex items-center gap-2">
            <Banknote className="w-4 h-4 text-[#64748B]" />
            Payment Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <p className="text-xs font-medium text-[#64748B] uppercase tracking-wider">Bank Name</p>
              <p className="mt-1 text-sm text-[#0F172A]">{pap.bankName || "—"}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-[#64748B] uppercase tracking-wider">Account Number</p>
              <p className="mt-1 text-sm text-[#0F172A]">{pap.accountNumber || "—"}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-[#64748B] uppercase tracking-wider">Payment Code</p>
              <p className="mt-1 text-sm text-[#0F172A]">{pap.paymentCode || "—"}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-[#64748B] uppercase tracking-wider">Paid Amount</p>
              <p className="mt-1 text-sm font-semibold text-[#0F172A]">
                {formatCurrency(pap.paidAmount)}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-[#64748B] uppercase tracking-wider">Payment Date</p>
              <p className="mt-1 text-sm text-[#0F172A]">{formatDate(pap.paidDate)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Timestamps */}
      <div className="text-xs text-[#94A3B8] text-right">
        Created: {formatDateTime(pap.createdAt)} | Last updated: {formatDateTime(pap.updatedAt)}
      </div>

      {/* Valuation Modal */}
      <ValuationModal
        isOpen={showValuationModal}
        onClose={() => setShowValuationModal(false)}
        onSubmit={handleUpdateValuation}
        currentValues={{
          compensationAmount: pap.compensationAmount,
          valuationDate: pap.valuationDate,
          valuationComment: pap.valuationComment,
          compensationStatus: pap.compensationStatus,
        }}
      />
    </DashboardLayout>
  );
}

