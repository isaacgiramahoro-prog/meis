"use client";

import { useAuth } from "@/lib/context/AuthContext";
import DashboardLayout from "@/components/DashboardLayout";
import StatsCard from "@/components/StatsCard";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import {
  FileCheck,
  FileX,
  RefreshCw,
  Clock,
  Search,
  Loader2,
  Scale,
} from "lucide-react";
import { RecordCouncilModal, type RecordCouncilData } from "@/components/CouncilModals";

// --- Types ---
interface CouncilReviewInfo {
  id: string;
  reviewDate: string;
  reviewerName: string;
  decision: string;
  feedback: string | null;
  approvedAmount: number | null;
  createdAt: string;
  recordedBy: { id: string; name: string };
}

interface PapInCouncil {
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
  project: { id: string; name: string; location: string };
  councilReviews: CouncilReviewInfo[];
}

interface CouncilStats {
  totalInReview: number;
  approved: number;
  revisionNeeded: number;
  pending: number;
}

const decisionConfig: Record<
  string,
  { label: string; variant: "success" | "danger" | "warning" | "secondary" }
> = {
  APPROVED: { label: "Approved", variant: "success" },
  REVISION_NEEDED: { label: "Revision Needed", variant: "danger" },
  PENDING: { label: "Pending", variant: "warning" },
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

function formatCurrency(amount: number | null) {
  if (amount === null) return "—";
  return new Intl.NumberFormat("en-RW", {
    style: "currency",
    currency: "RWF",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function CouncilPage() {
  const { user } = useAuth();
  const router = useRouter();
  const role = user?.role || "VIEWER";

  const [paps, setPaps] = useState<PapInCouncil[]>([]);
  const [stats, setStats] = useState<CouncilStats>({
    totalInReview: 0,
    approved: 0,
    revisionNeeded: 0,
    pending: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [decisionFilter, setDecisionFilter] = useState("");

  // Modal state
  const [showRecordModal, setShowRecordModal] = useState(false);
  const [selectedPap, setSelectedPap] = useState<PapInCouncil | null>(null);

  // --- Fetch council data ---
  const fetchCouncilData = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const params = new URLSearchParams();
      if (searchQuery) params.set("search", searchQuery);
      if (decisionFilter) params.set("decision", decisionFilter);

      const res = await fetch(`/api/council?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setPaps(data.data.paps);
        setStats(data.data.stats);
      }
    } catch {
      // Silent fail
    } finally {
      setLoading(false);
    }
  }, [searchQuery, decisionFilter]);

  useEffect(() => {
    fetchCouncilData();
  }, [fetchCouncilData]);

  // --- Record council review ---
  const handleRecordReview = async (data: RecordCouncilData) => {
    const token = localStorage.getItem("token");
    const res = await fetch("/api/council", {
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
    await fetchCouncilData();
  };

  const handleOpenRecord = (pap: PapInCouncil) => {
    setSelectedPap(pap);
    setShowRecordModal(true);
  };

  const latestReview = (pap: PapInCouncil) =>
    pap.councilReviews.length > 0 ? pap.councilReviews[0] : null;

  const getStatusStyle = (status: string) => {
    if (status === "COUNCIL_REVIEW")
      return { label: "Council Review", variant: "warning" as const };
    return { label: status, variant: "secondary" as const };
  };

  return (
    <DashboardLayout>
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A]">
            Council Review
          </h1>
          <p className="text-[#64748B] mt-1">
            Review and approve PAP compensation information
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
        <StatsCard
          title="In Council Review"
          value={stats.totalInReview}
          icon={<Scale className="w-full h-full" />}
          iconBg="bg-[#DBEAFE]"
          iconColor="text-[#1E3A8A]"
        />
        <StatsCard
          title="Approved"
          value={stats.approved}
          icon={<FileCheck className="w-full h-full" />}
          iconBg="bg-[#DCFCE7]"
          iconColor="text-[#16A34A]"
        />
        <StatsCard
          title="Revision Needed"
          value={stats.revisionNeeded}
          icon={<RefreshCw className="w-full h-full" />}
          iconBg="bg-[#FEF9C3]"
          iconColor="text-[#EAB308]"
        />
        <StatsCard
          title="Pending Review"
          value={stats.pending}
          icon={<Clock className="w-full h-full" />}
          iconBg="bg-[#F1F5F9]"
          iconColor="text-[#64748B]"
        />
      </div>

      {/* Filters */}
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
        <div className="w-full sm:w-48">
          <select
            value={decisionFilter}
            onChange={(e) => setDecisionFilter(e.target.value)}
            className="w-full px-3 py-2.5 text-sm border border-[#CBD5E1] rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition-all"
          >
            <option value="">All Decisions</option>
            <option value="PENDING">Pending</option>
            <option value="APPROVED">Approved</option>
            <option value="REVISION_NEEDED">Revision Needed</option>
          </select>
        </div>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 text-[#1E3A8A] animate-spin" />
        </div>
      ) : paps.length > 0 ? (
        /* Council Review Table */
        <div className="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC]">
                  <th className="text-left px-4 py-3 font-semibold text-[#0F172A]">Owner</th>
                  <th className="text-left px-4 py-3 font-semibold text-[#0F172A]">Beneficiary</th>
                  <th className="text-left px-4 py-3 font-semibold text-[#0F172A]">UPI</th>
                  <th className="text-left px-4 py-3 font-semibold text-[#0F172A]">Status</th>
                  <th className="text-left px-4 py-3 font-semibold text-[#0F172A]">Compensation</th>
                  <th className="text-left px-4 py-3 font-semibold text-[#0F172A]">Last Review</th>
                  <th className="text-left px-4 py-3 font-semibold text-[#0F172A]">Decision</th>
                  <th className="text-left px-4 py-3 font-semibold text-[#0F172A]">Project</th>
                  <th className="text-left px-4 py-3 font-semibold text-[#0F172A]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0]">
                {paps.map((pap) => {
                  const review = latestReview(pap);
                  const reviewConfig = review
                    ? decisionConfig[review.decision]
                    : null;
                  const statusStyle = getStatusStyle(pap.compensationStatus);

                  return (
                    <tr
                      key={pap.id}
                      className="hover:bg-[#F8FAFC] transition-colors"
                    >
                      <td
                        className="px-4 py-3 cursor-pointer"
                        onClick={() => router.push(`/paps/${pap.id}`)}
                      >
                        <p className="font-medium text-[#0F172A]">{pap.ownerName}</p>
                        <p className="text-xs text-[#64748B]">{pap.ownerId}</p>
                      </td>
                      <td
                        className="px-4 py-3 text-[#0F172A] cursor-pointer"
                        onClick={() => router.push(`/paps/${pap.id}`)}
                      >
                        {pap.beneficiaryName}
                      </td>
                      <td
                        className="px-4 py-3 cursor-pointer"
                        onClick={() => router.push(`/paps/${pap.id}`)}
                      >
                        <code className="text-xs bg-[#F1F5F9] px-1.5 py-0.5 rounded text-[#1E3A8A]">
                          {pap.affectedUpi}
                        </code>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={statusStyle.variant}>
                          {statusStyle.label}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 font-medium text-[#0F172A]">
                        {formatCurrency(pap.compensationAmount)}
                      </td>
                      <td className="px-4 py-3 text-xs text-[#64748B]">
                        {review
                          ? formatDateTime(review.createdAt)
                          : "No review yet"}
                      </td>
                      <td className="px-4 py-3">
                        {reviewConfig ? (
                          <Badge variant={reviewConfig.variant}>
                            {reviewConfig.label}
                          </Badge>
                        ) : (
                          <span className="text-xs text-[#94A3B8]">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs text-[#64748B]">
                        {pap.project.name}
                      </td>
                      <td className="px-4 py-3">
                        {role !== "VIEWER" && (
                          <button
                            onClick={() => handleOpenRecord(pap)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-[#1E3A8A] text-white rounded-lg hover:bg-[#1D4ED8] transition-colors"
                          >
                            <Scale className="w-3.5 h-3.5" />
                            {review ? "Re-review" : "Review"}
                          </button>
                        )}
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
              <Scale className="w-8 h-8 text-[#64748B]" />
            </div>
            <h3 className="text-lg font-semibold text-[#0F172A] mb-2">
              No PAPs in council review
            </h3>
            <p className="text-sm text-[#64748B] max-w-sm mx-auto">
              PAPs with compensation status set to "Council Review" will
              appear here for review and approval.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Record Council Review Modal */}
      {selectedPap && (
        <RecordCouncilModal
          isOpen={showRecordModal}
          onClose={() => {
            setShowRecordModal(false);
            setSelectedPap(null);
          }}
          onSubmit={handleRecordReview}
          papId={selectedPap.id}
          papOwnerName={selectedPap.ownerName}
          currentCompensationAmount={selectedPap.compensationAmount}
          currentCompensationStatus={selectedPap.compensationStatus}
        />
      )}
    </DashboardLayout>
  );
}

