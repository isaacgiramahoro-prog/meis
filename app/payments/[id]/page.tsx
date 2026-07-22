"use client";

import { useAuth } from "@/lib/context/AuthContext";
import DashboardLayout from "@/components/DashboardLayout";
import StatsCard from "@/components/StatsCard";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import {
  ArrowLeft, DollarSign, Building2, User, FolderKanban,
  Loader2, Calendar, CheckCircle2, XCircle, Clock,
  AlertTriangle, Hash, FileText,
} from "lucide-react";
import {
  UpdatePaymentStatusModal,
  type UpdatePaymentFormData,
} from "@/components/PaymentModals";

interface PaymentDetail {
  id: string;
  beneficiaryName: string;
  beneficiaryId: string;
  beneficiaryPhone: string | null;
  beneficiaryEmail: string | null;
  bankName: string;
  accountNumber: string;
  amount: number;
  paymentCode: string | null;
  paidDate: string | null;
  status: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  pap: Record<string, any>;
  project: Record<string, any>;
  recordedBy: Record<string, any> | null;
}

const statusConfig: Record<string, { label: string; variant: "info" | "success" | "danger" | "secondary" }> = {
  PENDING: { label: "Pending", variant: "info" },
  PAID: { label: "Paid", variant: "success" },
  FAILED: { label: "Failed", variant: "danger" },
  CANCELLED: { label: "Cancelled", variant: "secondary" },
};

function formatDate(dateStr: string | null) {
  if (!dateStr) return "\u2014";
  return new Date(dateStr).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

function formatDateTime(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

function formatCurrency(amount: number | null) {
  if (amount === null) return "\u2014";
  return new Intl.NumberFormat("en-RW", { style: "currency", currency: "RWF", minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount);
}

export default function PaymentDetailPage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const role = user?.role || "VIEWER";
  const paymentId = params.id as string;

  const [payment, setPayment] = useState<PaymentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showUpdateModal, setShowUpdateModal] = useState(false);

  const fetchPayment = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const token = localStorage.getItem("token");
      const res = await fetch("/api/payments/" + paymentId, {
        headers: { Authorization: "Bearer " + token },
      });
      const data = await res.json();
      if (data.success) {
        setPayment(data.data.payment);
      } else {
        setError(data.message || "Payment not found");
      }
    } catch {
      setError("Failed to load payment details");
    } finally {
      setLoading(false);
    }
  }, [paymentId]);

  useEffect(() => {
    fetchPayment();
  }, [fetchPayment]);

  const handleUpdateStatus = async (data: UpdatePaymentFormData) => {
    const token = localStorage.getItem("token");
    const res = await fetch("/api/payments/" + paymentId, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
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
    await fetchPayment();
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

  if (error || !payment) {
    return (
      <DashboardLayout>
        <div className="text-center py-24">
          <p className="text-[#DC2626] text-lg font-medium mb-4">{error || "Payment not found"}</p>
          <button
            onClick={() => router.push("/payments")}
            className="inline-flex items-center gap-2 text-sm text-[#1E3A8A] hover:text-[#1D4ED8] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Payments
          </button>
        </div>
      </DashboardLayout>
    );
  }

  const config = statusConfig[payment.status] || {
    label: payment.status,
    variant: "secondary" as const,
  };

  const p = payment.pap || {};
  const proj = payment.project || {};

  return (
    <DashboardLayout>
      <button
        onClick={() => router.push("/payments")}
        className="inline-flex items-center gap-2 text-sm text-[#64748B] hover:text-[#1E3A8A] transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Payments
      </button>

      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6 mb-8">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-bold text-[#0F172A]">Payment Details</h1>
            <Badge variant={config.variant} className="text-sm px-3 py-1">
              {config.label}
            </Badge>
          </div>
          <div className="flex items-center gap-4 text-sm text-[#64748B] flex-wrap">
            <span className="flex items-center gap-1">
              <User className="w-4 h-4" />
              {payment.beneficiaryName}
            </span>
            <span className="flex items-center gap-1">
              <Building2 className="w-4 h-4" />
              {payment.bankName}
            </span>
            <span className="flex items-center gap-1">
              <FolderKanban className="w-4 h-4" />
              {proj.name}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {formatDate(payment.createdAt)}
            </span>
          </div>
        </div>
        {role !== "VIEWER" && (
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setShowUpdateModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#1E3A8A] text-white text-sm font-semibold rounded-lg hover:bg-[#1D4ED8] transition-colors"
            >
              <Clock className="w-4 h-4" />
              Update Status
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatsCard
          title="Amount"
          value={formatCurrency(payment.amount)}
          icon={<DollarSign className="w-full h-full" />}
          iconBg="bg-[#DBEAFE]"
          iconColor="text-[#1E3A8A]"
        />
        <StatsCard
          title="Status"
          value={config.label}
          icon={payment.status === "PAID" ? <CheckCircle2 className="w-full h-full" /> : <AlertTriangle className="w-full h-full" />}
          iconBg={payment.status === "PAID" ? "bg-[#DCFCE7]" : "bg-[#F1F5F9]"}
          iconColor={payment.status === "PAID" ? "text-[#16A34A]" : "text-[#64748B]"}
        />
        <StatsCard
          title="Payment Code"
          value={payment.paymentCode || "\u2014"}
          icon={<Hash className="w-full h-full" />}
          iconBg="bg-[#CCFBF1]"
          iconColor="text-[#0F766E]"
        />
        <StatsCard
          title="Payment Date"
          value={formatDate(payment.paidDate)}
          icon={<Calendar className="w-full h-full" />}
          iconBg="bg-[#FEF9C3]"
          iconColor="text-[#EAB308]"
        />
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-base font-semibold text-[#0F172A] flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-[#64748B]" />
            Payment Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <p className="text-xs font-medium text-[#64748B] uppercase tracking-wider">Beneficiary Name</p>
              <p className="mt-1 text-sm text-[#0F172A] font-medium">{payment.beneficiaryName}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-[#64748B] uppercase tracking-wider">Beneficiary ID</p>
              <p className="mt-1 text-sm text-[#0F172A]">{payment.beneficiaryId}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-[#64748B] uppercase tracking-wider">Beneficiary Phone</p>
              <p className="mt-1 text-sm text-[#0F172A]">{payment.beneficiaryPhone || "\u2014"}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-[#64748B] uppercase tracking-wider">Beneficiary Email</p>
              <p className="mt-1 text-sm text-[#0F172A]">{payment.beneficiaryEmail || "\u2014"}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-[#64748B] uppercase tracking-wider">Bank Name</p>
              <p className="mt-1 text-sm text-[#0F172A] font-medium">{payment.bankName}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-[#64748B] uppercase tracking-wider">Account Number</p>
              <p className="mt-1 text-sm font-mono text-[#1E3A8A]">{payment.accountNumber}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-[#64748B] uppercase tracking-wider">Amount</p>
              <p className="mt-1 text-sm text-[#0F172A] font-bold">{formatCurrency(payment.amount)}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-[#64748B] uppercase tracking-wider">Payment Code</p>
              <p className="mt-1 text-sm font-mono text-[#0F172A]">{payment.paymentCode || "\u2014"}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-[#64748B] uppercase tracking-wider">Recorded By</p>
              <p className="mt-1 text-sm text-[#0F172A]">{payment.recordedBy?.name || "\u2014"}</p>
            </div>
          </div>
          {payment.notes && (
            <div className="mt-6 p-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg">
              <p className="text-xs font-medium text-[#64748B] uppercase tracking-wider mb-2">Notes</p>
              <p className="text-sm text-[#0F172A] whitespace-pre-wrap">{payment.notes}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-base font-semibold text-[#0F172A] flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#64748B]" />
            Approval Signatures
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className={"p-4 rounded-lg border " + (p.ownerSigned ? "bg-[#DCFCE7] border-[#86EFAC]" : "bg-[#FEF2F2] border-[#FECACA]")}>
              <div className="flex items-center gap-2 mb-2">
                {p.ownerSigned ? <CheckCircle2 className="w-4 h-4 text-[#16A34A]" /> : <XCircle className="w-4 h-4 text-[#DC2626]" />}
                <span className="text-sm font-semibold text-[#0F172A]">Owner Signed</span>
              </div>
              <p className="text-xs text-[#64748B]">{p.ownerSigned ? "Signed on " + formatDate(p.ownerSignedDate) : "Not signed"}</p>
            </div>
            <div className={"p-4 rounded-lg border " + (p.cellSigned ? "bg-[#DCFCE7] border-[#86EFAC]" : "bg-[#FEF2F2] border-[#FECACA]")}>
              <div className="flex items-center gap-2 mb-2">
                {p.cellSigned ? <CheckCircle2 className="w-4 h-4 text-[#16A34A]" /> : <XCircle className="w-4 h-4 text-[#DC2626]" />}
                <span className="text-sm font-semibold text-[#0F172A]">Cell Signed</span>
              </div>
              <p className="text-xs text-[#64748B]">{p.cellSigned ? "Signed on " + formatDate(p.cellSignedDate) : "Not signed"}</p>
            </div>
            <div className={"p-4 rounded-lg border " + (p.sectorSigned ? "bg-[#DCFCE7] border-[#86EFAC]" : "bg-[#FEF2F2] border-[#FECACA]")}>
              <div className="flex items-center gap-2 mb-2">
                {p.sectorSigned ? <CheckCircle2 className="w-4 h-4 text-[#16A34A]" /> : <XCircle className="w-4 h-4 text-[#DC2626]" />}
                <span className="text-sm font-semibold text-[#0F172A]">Sector Signed</span>
              </div>
              <p className="text-xs text-[#64748B]">{p.sectorSigned ? "Signed on " + formatDate(p.sectorSignedDate) : "Not signed"}</p>
            </div>
          </div>
        </CardContent>
      </Card>

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
              <p className="mt-1 text-sm text-[#0F172A] font-medium">{p.ownerName}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-[#64748B] uppercase tracking-wider">Owner ID</p>
              <p className="mt-1 text-sm text-[#0F172A]">{p.ownerId}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-[#64748B] uppercase tracking-wider">Compensation Status</p>
              <div className="mt-1"><Badge variant="info">{p.compensationStatus}</Badge></div>
            </div>
            <div>
              <p className="text-xs font-medium text-[#64748B] uppercase tracking-wider">Compensation Amount</p>
              <p className="mt-1 text-sm text-[#0F172A] font-semibold">{formatCurrency(p.compensationAmount)}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-[#64748B] uppercase tracking-wider">Location</p>
              <p className="mt-1 text-sm text-[#0F172A]">{p.sector}, {p.cell}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-[#64748B] uppercase tracking-wider">Affected UPI</p>
              <p className="mt-1 text-sm font-mono text-[#1E3A8A]">{p.affectedUpi}</p>
            </div>
          </div>
          <div className="mt-4">
            <button onClick={() => router.push("/paps/" + p.id)} className="text-sm text-[#1E3A8A] hover:text-[#1D4ED8] font-medium transition-colors">
              View full PAP details &rarr;
            </button>
          </div>
        </CardContent>
      </Card>

      <div className="text-xs text-[#94A3B8] text-right">
        Created: {formatDateTime(payment.createdAt)} | Last updated: {formatDateTime(payment.updatedAt)}
      </div>

      <UpdatePaymentStatusModal
        isOpen={showUpdateModal}
        onClose={() => setShowUpdateModal(false)}
        onSubmit={handleUpdateStatus}
        currentStatus={payment.status}
        currentPaymentCode={payment.paymentCode}
        beneficiaryName={payment.beneficiaryName}
        amount={payment.amount}
      />
    </DashboardLayout>
  );
}