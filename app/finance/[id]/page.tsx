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
  User,
  FolderKanban,
  Calendar,
  FileText,
  Loader2,
  CheckCircle2,
  XCircle,
  RefreshCw,
} from "lucide-react";

interface FinanceReviewDetail {
  id: string;
  reviewDate: string;
  reviewerName: string;
  decision: string;
  feedback: string | null;
  approvedAmount: number | null;
  createdAt: string;
  updatedAt: string;
  recordedBy: { id: string; name: string; email: string };
  pap: {
    id: string;
    ownerName: string;
    ownerId: string;
    beneficiaryName: string;
    beneficiaryId: string;
    compensationAmount: number | null;
    compensationStatus: string;
    affectedUpi: string;
    affectedArea: number;
    propertyType: string;
    sector: string;
    cell: string;
    village: string;
    ownerSigned: boolean;
    cellSigned: boolean;
    sectorSigned: boolean;
    project: { id: string; name: string; location: string };
  };
  project: { id: string; name: string };
}

const decisionConfig: Record<string, { label: string; variant: "success" | "danger" | "warning" | "secondary" }> = {
  APPROVED: { label: "Approved", variant: "success" },
  DECLINED: { label: "Declined", variant: "danger" },
  REVISION_NEEDED: { label: "Revision Needed", variant: "warning" },
  PENDING: { label: "Pending", variant: "secondary" },
};

function formatDate(dateStr: string | null) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
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

export default function FinanceDetailPage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const role = user?.role || "VIEWER";
  const reviewId = params.id as string;

  const [review, setReview] = useState<FinanceReviewDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchReview = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/finance/${reviewId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setReview(data.data.review);
      } else {
        setError(data.message || "Finance review not found");
      }
    } catch {
      setError("Failed to load finance review details");
    } finally {
      setLoading(false);
    }
  }, [reviewId]);

  useEffect(() => {
    fetchReview();
  }, [fetchReview]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-8 h-8 text-[#1E3A8A] animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  if (error || !review) {
    return (
      <DashboardLayout>
        <div className="text-center py-24">
          <p className="text-[#DC2626] text-lg font-medium mb-4">{error || "Finance review not found"}</p>
          <button
            onClick={() => router.push("/finance")}
            className="inline-flex items-center gap-2 text-sm text-[#1E3A8A] hover:text-[#1D4ED8] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Finance
          </button>
        </div>
      </DashboardLayout>
    );
  }

  const config = decisionConfig[review.decision] || {
    label: review.decision,
    variant: "secondary" as const,
  };

  const pap = review.pap;
  const project = review.project;

  return (
    <DashboardLayout>
      <button
        onClick={() => router.push("/finance")}
        className="inline-flex items-center gap-2 text-sm text-[#64748B] hover:text-[#1E3A8A] transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Finance
      </button>

      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6 mb-8">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-bold text-[#0F172A]">Finance Review Details</h1>
            <Badge variant={config.variant} className="text-sm px-3 py-1">
              {config.label}
            </Badge>
          </div>
          <div className="flex items-center gap-4 text-sm text-[#64748B] flex-wrap">
            <span className="flex items-center gap-1">
              <User className="w-4 h-4" />
              {pap.ownerName}
            </span>
            <span className="flex items-center gap-1">
              <FolderKanban className="w-4 h-4" />
              {project.name}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {formatDate(review.reviewDate)}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatsCard
          title="Approved Amount"
          value={formatCurrency(review.approvedAmount)}
          icon={<DollarSign className="w-full h-full" />}
          iconBg="bg-[#DBEAFE]"
          iconColor="text-[#1E3A8A]"
        />
        <StatsCard
          title="Reviewer"
          value={review.reviewerName}
          icon={<User className="w-full h-full" />}
          iconBg="bg-[#CCFBF1]"
          iconColor="text-[#0F766E]"
        />
        <StatsCard
          title="PAP Status"
          value={pap.compensationStatus.replace(/_/g, " ")}
          icon={<FileText className="w-full h-full" />}
          iconBg="bg-[#FEF9C3]"
          iconColor="text-[#EAB308]"
        />
        <StatsCard
          title="Recorded By"
          value={review.recordedBy.name}
          icon={<CheckCircle2 className="w-full h-full" />}
          iconBg="bg-[#DCFCE7]"
          iconColor="text-[#16A34A]"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold text-[#0F172A] flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#64748B]" />
              PAP Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-xs font-medium text-[#64748B] uppercase tracking-wider">Owner</p>
                <p className="mt-1 text-[#0F172A] font-medium">{pap.ownerName}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-[#64748B] uppercase tracking-wider">Beneficiary</p>
                <p className="mt-1 text-[#0F172A]">{pap.beneficiaryName}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-[#64748B] uppercase tracking-wider">UPI</p>
                <p className="mt-1 text-[#0F172A]">{pap.affectedUpi}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-[#64748B] uppercase tracking-wider">Area</p>
                <p className="mt-1 text-[#0F172A]">{pap.affectedArea} m²</p>
              </div>
              <div>
                <p className="text-xs font-medium text-[#64748B] uppercase tracking-wider">Property Type</p>
                <p className="mt-1 text-[#0F172A]">{pap.propertyType}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-[#64748B] uppercase tracking-wider">Location</p>
                <p className="mt-1 text-[#0F172A]">{pap.sector} / {pap.cell} / {pap.village}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold text-[#0F172A] flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#64748B]" />
              Review Notes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 text-sm">
              <div>
                <p className="text-xs font-medium text-[#64748B] uppercase tracking-wider">Decision</p>
                <p className="mt-1 text-[#0F172A] font-medium">{config.label}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-[#64748B] uppercase tracking-wider">Feedback</p>
                <p className="mt-1 text-[#0F172A]">{review.feedback || "No feedback provided"}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-[#64748B] uppercase tracking-wider">Created</p>
                <p className="mt-1 text-[#0F172A]">{formatDate(review.createdAt)}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-[#64748B] uppercase tracking-wider">Recorded By</p>
                <p className="mt-1 text-[#0F172A]">{review.recordedBy.name}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
