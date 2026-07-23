"use client";

import { useAuth } from "@/lib/context/AuthContext";
import DashboardLayout from "@/components/DashboardLayout";
import StatsCard from "@/components/StatsCard";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import {
  DollarSign,
  Search,
  Loader2,
  FileCheck,
  RefreshCw,
  Clock,
  Scale,
  Eye,
} from "lucide-react";
import { RecordFinanceReviewModal } from "@/components/FinanceModals";
import type { FinanceDecision } from "@/lib/validations";

interface FinanceReviewInfo {
  id: string;
  reviewDate: string;
  reviewerName: string;
  decision: FinanceDecision;
  feedback: string | null;
  approvedAmount: number | null;
  recordedBy: { id: string; name: string };
}

interface PapInFinance {
  id: string;
  ownerName: string;
  ownerId: string;
  beneficiaryName: string;
  compensationAmount: number | null;
  compensationStatus: string;
  sector: string;
  cell: string;
  village: string;
  projectId: string;
  project: { id: string; name: string; location: string };
  financeReviews: FinanceReviewInfo[];
  _count: { financeReviews: number };
}

interface FinanceStats {
  totalInFinance: number;
  approved: number;
  declined: number;
  pending: number;
  revisionNeeded: number;
}

const decisionConfig: Record<string, { label: string; variant: "success" | "danger" | "warning" | "secondary" }> = {
  APPROVED: { label: "Approved", variant: "success" },
  DECLINED: { label: "Declined", variant: "danger" },
  REVISION_NEEDED: { label: "Revision Needed", variant: "warning" },
  PENDING: { label: "Pending", variant: "secondary" },
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

export default function FinancePage() {
  const { user } = useAuth();
  const role = user?.role || "VIEWER";

  const [paps, setPaps] = useState<PapInFinance[]>([]);
  const [stats, setStats] = useState<FinanceStats>({
    totalInFinance: 0,
    approved: 0,
    declined: 0,
    pending: 0,
    revisionNeeded: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [decisionFilter, setDecisionFilter] = useState("");
  const [showRecordModal, setShowRecordModal] = useState(false);
  const [selectedPap, setSelectedPap] = useState<PapInFinance | null>(null);

  const fetchFinanceData = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const params = new URLSearchParams();
      if (searchQuery) params.set("search", searchQuery);
      if (decisionFilter) params.set("decision", decisionFilter);

      const res = await fetch(`/api/finance?${params.toString()}`, {
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
    fetchFinanceData();
  }, [fetchFinanceData]);

  const handleRecordReview = async (data: {
    papId: string;
    projectId: string;
    reviewerName: string;
    reviewDate: string;
    decision: FinanceDecision;
    feedback: string;
    approvedAmount: number | null;
  }) => {
    const token = localStorage.getItem("token");
    const res = await fetch("/api/finance", {
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
    await fetchFinanceData();
  };

  const handleOpenRecord = (pap: PapInFinance) => {
    setSelectedPap(pap);
    setShowRecordModal(true);
  };

  const latestReview = (pap: PapInFinance) =>
    pap.financeReviews.length > 0 ? pap.financeReviews[0] : null;

  return (
    <DashboardLayout>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A]">Finance Review</h1>
          <p className="text-[#64748B] mt-1">
            Review PAP compensation values and approve or revise finance decisions
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 lg:gap-6 mb-8">
        <StatsCard
          title="In Finance"
          value={stats.totalInFinance}
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
          title="Declined"
          value={stats.declined}
          icon={<Clock className="w-full h-full" />}
          iconBg="bg-[#FEE2E2]"
          iconColor="text-[#DC2626]"
        />
        <StatsCard
          title="Pending"
          value={stats.pending}
          icon={<Clock className="w-full h-full" />}
          iconBg="bg-[#F1F5F9]"
          iconColor="text-[#64748B]"
        />
        <StatsCard
          title="Revision Needed"
          value={stats.revisionNeeded}
          icon={<RefreshCw className="w-full h-full" />}
          iconBg="bg-[#FEF9C3]"
          iconColor="text-[#EAB308]"
        />
      </div>

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
        <div className="w-full sm:w-52">
          <select
            value={decisionFilter}
            onChange={(e) => setDecisionFilter(e.target.value)}
            className="w-full px-3 py-2.5 text-sm border border-[#CBD5E1] rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition-all"
          >
            <option value="">All Decisions</option>
            <option value="PENDING">Pending</option>
            <option value="APPROVED">Approved</option>
            <option value="DECLINED">Declined</option>
            <option value="REVISION_NEEDED">Revision Needed</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 text-[#1E3A8A] animate-spin" />
        </div>
      ) : paps.length > 0 ? (
        <div className="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#F8FAFC] text-[#64748B]">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold">PAP</th>
                  <th className="text-left px-4 py-3 font-semibold">Project</th>
                  <th className="text-left px-4 py-3 font-semibold">Compensation</th>
                  <th className="text-left px-4 py-3 font-semibold">Latest Review</th>
                  <th className="text-left px-4 py-3 font-semibold">Decision</th>
                  <th className="text-left px-4 py-3 font-semibold">Action</th>
                </tr>
              </thead>
              <tbody>
                {paps.map((pap) => {
                  const review = latestReview(pap);
                  const config = review ? decisionConfig[review.decision] : { label: "Pending", variant: "secondary" as const };
                  return (
                    <tr key={pap.id} className="border-t border-[#E2E8F0] align-top">
                      <td className="px-4 py-4">
                        <div className="font-medium text-[#0F172A]">{pap.ownerName}</div>
                        <div className="text-xs text-[#64748B]">{pap.beneficiaryName}</div>
                        <div className="text-xs text-[#64748B]">{pap.project.location}</div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="font-medium text-[#0F172A]">{pap.project.name}</div>
                        <div className="text-xs text-[#64748B]">{pap.sector} / {pap.cell}</div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="font-medium text-[#0F172A]">{formatCurrency(pap.compensationAmount)}</div>
                        <div className="text-xs text-[#64748B]">{pap.compensationStatus.replace(/_/g, " ")}</div>
                      </td>
                      <td className="px-4 py-4">
                        {review ? (
                          <div>
                            <div className="font-medium text-[#0F172A]">{review.reviewerName}</div>
                            <div className="text-xs text-[#64748B]">{formatDate(review.reviewDate)}</div>
                            <div className="text-xs text-[#64748B]">{review.feedback || "No comments"}</div>
                          </div>
                        ) : (
                          <span className="text-[#64748B] text-xs">No review recorded yet</span>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <Badge variant={config.variant} className="text-xs px-2 py-1">
                          {config.label}
                        </Badge>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          {review ? (
                            <Link
                              href={`/finance/${review.id}`}
                              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-[#1E3A8A] border border-[#CBD5E1] rounded-lg hover:bg-[#F8FAFC] transition-colors"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              View
                            </Link>
                          ) : (
                            <button
                              onClick={() => handleOpenRecord(pap)}
                              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-[#1E3A8A] text-white rounded-lg hover:bg-[#1D4ED8] transition-colors"
                            >
                              <DollarSign className="w-3.5 h-3.5" />
                              Record
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
        <Card>
          <CardContent className="p-8 text-center text-[#64748B]">
            No PAPs found in finance review.
          </CardContent>
        </Card>
      )}

      {selectedPap && (
        <RecordFinanceReviewModal
          isOpen={showRecordModal}
          onClose={() => {
            setShowRecordModal(false);
            setSelectedPap(null);
          }}
          papId={selectedPap.id}
          projectId={selectedPap.projectId}
          currentAmount={selectedPap.compensationAmount}
          onSubmit={handleRecordReview}
        />
      )}
    </DashboardLayout>
  );
}
