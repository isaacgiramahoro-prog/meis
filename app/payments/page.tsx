"use client";

import { useAuth } from "@/lib/context/AuthContext";
import DashboardLayout from "@/components/DashboardLayout";
import StatsCard from "@/components/StatsCard";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import {
  DollarSign,
  Search,
  Loader2,
  Eye,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
} from "lucide-react";
import { CreatePaymentModal, UpdatePaymentStatusModal, type CreatePaymentFormData, type UpdatePaymentFormData } from "@/components/PaymentModals";

// --- Types ---
interface Payment {
  id: string;
  beneficiaryName: string;
  beneficiaryId: string;
  bankName: string;
  accountNumber: string;
  amount: number;
  paymentCode: string | null;
  paidDate: string | null;
  status: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  pap: {
    id: string;
    ownerName: string;
    ownerId: string;
    beneficiaryName: string;
    beneficiaryId: string;
    affectedUpi: string;
    sector: string;
    cell: string;
    compensationStatus: string;
  };
  project: {
    id: string;
    name: string;
    location: string;
  };
  recordedBy: {
    id: string;
    name: string;
  } | null;
}

interface PaymentStats {
  total: number;
  pending: number;
  paid: number;
  failed: number;
  cancelled: number;
}

const statusConfig: Record<string, { label: string; variant: "info" | "warning" | "success" | "danger" | "secondary" }> = {
  PENDING: { label: "Pending", variant: "info" },
  PAID: { label: "Paid", variant: "success" },
  FAILED: { label: "Failed", variant: "danger" },
  CANCELLED: { label: "Cancelled", variant: "secondary" },
};

function formatDate(dateStr: string | null) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
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

export default function PaymentsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const role = user?.role || "VIEWER";

  const [payments, setPayments] = useState<Payment[]>([]);
  const [stats, setStats] = useState<PaymentStats>({
    total: 0,
    pending: 0,
    paid: 0,
    failed: 0,
    cancelled: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [paps, setPaps] = useState<{ id: string; ownerName: string; projectId: string; beneficiaryName: string; beneficiaryId: string; beneficiaryPhone: string | null; beneficiaryEmail: string | null; bankName: string | null; accountNumber: string | null }[]>([]);

  // --- Fetch payments ---
  const fetchPayments = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const params = new URLSearchParams();
      if (searchQuery) params.set("search", searchQuery);
      if (statusFilter) params.set("status", statusFilter);

      const res = await fetch(`/api/payments?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setPayments(data.data.payments);
        setStats(data.data.stats);
      }
    } catch {
      // Silent fail
    } finally {
      setLoading(false);
    }
  }, [searchQuery, statusFilter]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

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
          (data.data.paps || []).map((p: { id: string; ownerName: string; projectId: string; beneficiaryName: string; beneficiaryId: string; beneficiaryPhone: string | null; beneficiaryEmail: string | null; bankName: string | null; accountNumber: string | null }) => ({
            id: p.id,
            ownerName: p.ownerName,
            projectId: p.projectId,
            beneficiaryName: p.beneficiaryName,
            beneficiaryId: p.beneficiaryId,
            beneficiaryPhone: p.beneficiaryPhone,
            beneficiaryEmail: p.beneficiaryEmail,
            bankName: p.bankName,
            accountNumber: p.accountNumber,
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

  // --- Create payment ---
  const handleCreatePayment = async (data: CreatePaymentFormData) => {
    const token = localStorage.getItem("token");
    const res = await fetch("/api/payments", {
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
    await fetchPayments();
  };

  // --- Update payment status ---
  const handleUpdateStatus = async (data: UpdatePaymentFormData) => {
    if (!selectedPayment) return;
    const token = localStorage.getItem("token");
    const res = await fetch(`/api/payments/${selectedPayment.id}`, {
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
    setSelectedPayment(null);
    await fetchPayments();
  };

  const handleOpenUpdate = (payment: Payment) => {
    setSelectedPayment(payment);
    setShowUpdateModal(true);
  };

  // State for create modal with PAP selection
  const [selectedPapId, setSelectedPapId] = useState("");
  const [selectedPapProjectId, setSelectedPapProjectId] = useState("");
  const [selectedPapOwnerName, setSelectedPapOwnerName] = useState("");
  const [selectedPapBeneficiaryName, setSelectedPapBeneficiaryName] = useState("");
  const [selectedPapBeneficiaryId, setSelectedPapBeneficiaryId] = useState("");
  const [selectedPapBeneficiaryPhone, setSelectedPapBeneficiaryPhone] = useState("");
  const [selectedPapBeneficiaryEmail, setSelectedPapBeneficiaryEmail] = useState("");
  const [selectedPapBankName, setSelectedPapBankName] = useState("");
  const [selectedPapAccountNumber, setSelectedPapAccountNumber] = useState("");

  const handlePapSelect = (papId: string) => {
    const pap = paps.find((p) => p.id === papId);
    if (pap) {
      setSelectedPapId(pap.id);
      setSelectedPapProjectId(pap.projectId);
      setSelectedPapOwnerName(pap.ownerName);
      setSelectedPapBeneficiaryName(pap.beneficiaryName);
      setSelectedPapBeneficiaryId(pap.beneficiaryId);
      setSelectedPapBeneficiaryPhone(pap.beneficiaryPhone || "");
      setSelectedPapBeneficiaryEmail(pap.beneficiaryEmail || "");
      setSelectedPapBankName(pap.bankName || "");
      setSelectedPapAccountNumber(pap.accountNumber || "");
    }
  };

  // Reset selection when modal closes
  const handleCloseCreateModal = () => {
    setShowCreateModal(false);
    setSelectedPapId("");
    setSelectedPapProjectId("");
    setSelectedPapOwnerName("");
    setSelectedPapBeneficiaryName("");
    setSelectedPapBeneficiaryId("");
    setSelectedPapBeneficiaryPhone("");
    setSelectedPapBeneficiaryEmail("");
    setSelectedPapBankName("");
    setSelectedPapAccountNumber("");
  };

  return (
    <DashboardLayout>
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A]">
            Payment Management
          </h1>
          <p className="text-[#64748B] mt-1">
            Track beneficiary payment information and payment status
          </p>
        </div>
        {role !== "VIEWER" && (
          <button
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#1E3A8A] text-white text-sm font-semibold rounded-lg hover:bg-[#1D4ED8] transition-colors"
          >
            <DollarSign className="w-4 h-4" />
            New Payment
          </button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 lg:gap-6 mb-8">
        <StatsCard
          title="Total Payments"
          value={stats.total}
          icon={<DollarSign className="w-full h-full" />}
          iconBg="bg-[#DBEAFE]"
          iconColor="text-[#1E3A8A]"
        />
        <StatsCard
          title="Pending"
          value={stats.pending}
          icon={<Clock className="w-full h-full" />}
          iconBg="bg-[#F1F5F9]"
          iconColor="text-[#64748B]"
        />
        <StatsCard
          title="Paid"
          value={stats.paid}
          icon={<CheckCircle2 className="w-full h-full" />}
          iconBg="bg-[#DCFCE7]"
          iconColor="text-[#16A34A]"
        />
        <StatsCard
          title="Failed"
          value={stats.failed}
          icon={<AlertTriangle className="w-full h-full" />}
          iconBg="bg-[#FEE2E2]"
          iconColor="text-[#DC2626]"
        />
        <StatsCard
          title="Cancelled"
          value={stats.cancelled}
          icon={<XCircle className="w-full h-full" />}
          iconBg="bg-[#F3F4F6]"
          iconColor="text-[#6B7280]"
        />
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
          <input
            type="text"
            placeholder="Search beneficiary, owner, bank, code..."
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
            <option value="PENDING">Pending</option>
            <option value="PAID">Paid</option>
            <option value="FAILED">Failed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 text-[#1E3A8A] animate-spin" />
        </div>
      ) : payments.length > 0 ? (
        /* Payments Table */
        <div className="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC]">
                  <th className="text-left px-4 py-3 font-semibold text-[#0F172A]">Beneficiary</th>
                  <th className="text-left px-4 py-3 font-semibold text-[#0F172A]">PAP Owner</th>
                  <th className="text-left px-4 py-3 font-semibold text-[#0F172A]">Bank</th>
                  <th className="text-left px-4 py-3 font-semibold text-[#0F172A]">Amount</th>
                  <th className="text-left px-4 py-3 font-semibold text-[#0F172A]">Status</th>
                  <th className="text-left px-4 py-3 font-semibold text-[#0F172A]">Code</th>
                  <th className="text-left px-4 py-3 font-semibold text-[#0F172A]">Date</th>
                  <th className="text-left px-4 py-3 font-semibold text-[#0F172A]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0]">
                {payments.map((payment) => {
                  const config = statusConfig[payment.status] || {
                    label: payment.status,
                    variant: "secondary" as const,
                  };

                  return (
                    <tr
                      key={payment.id}
                      className="hover:bg-[#F8FAFC] transition-colors"
                    >
                      <td
                        className="px-4 py-3 cursor-pointer"
                        onClick={() => router.push(`/payments/${payment.id}`)}
                      >
                        <p className="font-medium text-[#0F172A]">{payment.beneficiaryName}</p>
                        <p className="text-xs text-[#64748B]">{payment.beneficiaryId}</p>
                      </td>
                      <td
                        className="px-4 py-3 cursor-pointer"
                        onClick={() => router.push(`/payments/${payment.id}`)}
                      >
                        <p className="text-[#0F172A]">{payment.pap.ownerName}</p>
                        <p className="text-xs text-[#64748B]">{payment.pap.affectedUpi}</p>
                      </td>
                      <td className="px-4 py-3 text-[#0F172A]">{payment.bankName}</td>
                      <td
                        className="px-4 py-3 font-semibold text-[#0F172A] cursor-pointer"
                        onClick={() => router.push(`/payments/${payment.id}`)}
                      >
                        {formatCurrency(payment.amount)}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={config.variant}>{config.label}</Badge>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs font-mono text-[#64748B]">
                          {payment.paymentCode || "—"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-[#64748B]">
                        {formatDate(payment.paidDate || payment.createdAt)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => router.push(`/payments/${payment.id}`)}
                            className="p-1.5 rounded-lg text-[#64748B] hover:bg-[#F1F5F9] transition-colors"
                            title="View details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {role !== "VIEWER" && (
                            <button
                              onClick={() => handleOpenUpdate(payment)}
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
              <DollarSign className="w-8 h-8 text-[#64748B]" />
            </div>
            <h3 className="text-lg font-semibold text-[#0F172A] mb-2">
              No payment records
            </h3>
            <p className="text-sm text-[#64748B] max-w-sm mx-auto">
              {role !== "VIEWER"
                ? "Record a new payment to start tracking beneficiary compensation."
                : "Payment records will appear here once they are created."}
            </p>
            {role !== "VIEWER" && (
              <button
                onClick={handleOpenCreate}
                className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-[#1E3A8A] text-white text-sm font-semibold rounded-lg hover:bg-[#1D4ED8] transition-colors"
              >
                <DollarSign className="w-4 h-4" />
                New Payment
              </button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Create Payment Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="flex flex-row items-center justify-between border-b border-[#E2E8F0] px-6 py-4">
              <CardTitle className="text-lg font-semibold text-[#0F172A]">
                Select PAP
              </CardTitle>
              <button
                onClick={handleCloseCreateModal}
                className="p-1 rounded-lg text-[#64748B] hover:bg-[#F1F5F9] transition-colors"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-3 max-h-[60vh] overflow-y-auto">
                {paps.length === 0 ? (
                  <p className="text-sm text-[#64748B] text-center py-8">
                    No PAPs available. Please register PAPs first.
                  </p>
                ) : (
                  paps.map((pap) => (
                    <button
                      key={pap.id}
                      onClick={() => {
                        handlePapSelect(pap.id);
                        // Close the PAP selection and open the payment form
                        setShowCreateModal(false);
                        // Immediately show the payment form
                      }}
                      className="w-full text-left p-3 border border-[#E2E8F0] rounded-lg hover:bg-[#F8FAFC] hover:border-[#CBD5E1] transition-all"
                    >
                      <p className="text-sm font-medium text-[#0F172A]">{pap.ownerName}</p>
                      <p className="text-xs text-[#64748B]">Beneficiary: {pap.beneficiaryName}</p>
                      <p className="text-xs text-[#64748B]">ID: {pap.beneficiaryId}</p>
                    </button>
                  ))
                )}
                <button
                  onClick={handleCloseCreateModal}
                  className="w-full text-center text-sm text-[#64748B] hover:text-[#1E3A8A] py-2 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Payment Form (shown after PAP selection) */}
      <CreatePaymentModal
        isOpen={showCreateModal === false && selectedPapId !== ""}
        onClose={handleCloseCreateModal}
        onSubmit={handleCreatePayment}
        papId={selectedPapId}
        projectId={selectedPapProjectId}
        papOwnerName={selectedPapOwnerName}
        defaultBeneficiaryName={selectedPapBeneficiaryName}
        defaultBeneficiaryId={selectedPapBeneficiaryId}
        defaultBeneficiaryPhone={selectedPapBeneficiaryPhone}
        defaultBeneficiaryEmail={selectedPapBeneficiaryEmail}
        defaultBankName={selectedPapBankName}
        defaultAccountNumber={selectedPapAccountNumber}
      />

      {/* Update Payment Status Modal */}
      {selectedPayment && (
        <UpdatePaymentStatusModal
          isOpen={showUpdateModal}
          onClose={() => {
            setShowUpdateModal(false);
            setSelectedPayment(null);
          }}
          onSubmit={handleUpdateStatus}
          currentStatus={selectedPayment.status}
          currentPaymentCode={selectedPayment.paymentCode}
          beneficiaryName={selectedPayment.beneficiaryName}
          amount={selectedPayment.amount}
        />
      )}
    </DashboardLayout>
  );
}

