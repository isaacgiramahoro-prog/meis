"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { X, Loader2 } from "lucide-react";

// --- Types ---
export type PaymentStatus = "PENDING" | "PAID" | "FAILED" | "CANCELLED";

export interface CreatePaymentFormData {
  papId: string;
  projectId: string;
  beneficiaryName: string;
  beneficiaryId: string;
  beneficiaryPhone?: string;
  beneficiaryEmail?: string;
  bankName: string;
  accountNumber: string;
  amount: number;
  paymentCode?: string;
  paidDate?: string;
  notes?: string;
}

export interface UpdatePaymentFormData {
  status: PaymentStatus;
  paymentCode?: string;
  paidDate?: string;
  notes?: string;
}

const STATUS_OPTIONS: { value: PaymentStatus; label: string }[] = [
  { value: "PENDING", label: "Pending" },
  { value: "PAID", label: "Paid" },
  { value: "FAILED", label: "Failed" },
  { value: "CANCELLED", label: "Cancelled" },
];

// --- Create Payment Modal ---
export interface CreatePaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreatePaymentFormData) => Promise<void>;
  papId: string;
  projectId: string;
  papOwnerName: string;
  defaultBeneficiaryName?: string;
  defaultBeneficiaryId?: string;
  defaultBeneficiaryPhone?: string;
  defaultBeneficiaryEmail?: string;
  defaultBankName?: string;
  defaultAccountNumber?: string;
}

export function CreatePaymentModal({
  isOpen,
  onClose,
  onSubmit,
  papId,
  projectId,
  papOwnerName,
  defaultBeneficiaryName,
  defaultBeneficiaryId,
  defaultBeneficiaryPhone,
  defaultBeneficiaryEmail,
  defaultBankName,
  defaultAccountNumber,
}: CreatePaymentModalProps) {
  const [form, setForm] = useState({
    beneficiaryName: defaultBeneficiaryName || "",
    beneficiaryId: defaultBeneficiaryId || "",
    beneficiaryPhone: defaultBeneficiaryPhone || "",
    beneficiaryEmail: defaultBeneficiaryEmail || "",
    bankName: defaultBankName || "",
    accountNumber: defaultAccountNumber || "",
    amount: "",
    paymentCode: "",
    paidDate: "",
    notes: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setForm({
        beneficiaryName: defaultBeneficiaryName || "",
        beneficiaryId: defaultBeneficiaryId || "",
        beneficiaryPhone: defaultBeneficiaryPhone || "",
        beneficiaryEmail: defaultBeneficiaryEmail || "",
        bankName: defaultBankName || "",
        accountNumber: defaultAccountNumber || "",
        amount: "",
        paymentCode: "",
        paidDate: "",
        notes: "",
      });
      setErrors({});
    }
  }, [isOpen, defaultBeneficiaryName, defaultBeneficiaryId, defaultBeneficiaryPhone, defaultBeneficiaryEmail, defaultBankName, defaultAccountNumber]);

  if (!isOpen) return null;

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrors({});

    try {
      const localErrors: Record<string, string> = {};

      if (!form.beneficiaryName || form.beneficiaryName.trim().length < 2) {
        localErrors.beneficiaryName = "Beneficiary name must be at least 2 characters";
      }

      if (!form.beneficiaryId || form.beneficiaryId.trim().length < 2) {
        localErrors.beneficiaryId = "Beneficiary ID is required";
      }

      if (!form.bankName || form.bankName.trim().length < 2) {
        localErrors.bankName = "Bank name must be at least 2 characters";
      }

      if (!form.accountNumber || form.accountNumber.trim().length < 2) {
        localErrors.accountNumber = "Account number is required";
      }

      if (!form.amount || parseFloat(form.amount) <= 0) {
        localErrors.amount = "Amount must be greater than 0";
      }

      if (form.beneficiaryEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.beneficiaryEmail)) {
        localErrors.beneficiaryEmail = "Please enter a valid email address";
      }

      if (Object.keys(localErrors).length > 0) {
        throw localErrors;
      }

      await onSubmit({
        papId,
        projectId,
        beneficiaryName: form.beneficiaryName.trim(),
        beneficiaryId: form.beneficiaryId.trim(),
        beneficiaryPhone: form.beneficiaryPhone.trim() || undefined,
        beneficiaryEmail: form.beneficiaryEmail.trim() || undefined,
        bankName: form.bankName.trim(),
        accountNumber: form.accountNumber.trim(),
        amount: parseFloat(form.amount),
        paymentCode: form.paymentCode.trim() || undefined,
        paidDate: form.paidDate || undefined,
        notes: form.notes.trim() || undefined,
      });
      onClose();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrors({ form: err.message });
      } else if (typeof err === "object") {
        setErrors(err as Record<string, string>);
      } else {
        setErrors({ form: "Failed to create payment" });
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between border-b border-[#E2E8F0] px-6 py-4">
          <CardTitle className="text-lg font-semibold text-[#0F172A]">
            Record Payment
          </CardTitle>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#64748B] hover:bg-[#F1F5F9] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* PAP Info (read-only) */}
            <div className="p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg">
              <p className="text-xs font-medium text-[#64748B] uppercase tracking-wider">PAP Owner</p>
              <p className="mt-1 text-sm font-medium text-[#0F172A]">{papOwnerName}</p>
            </div>

            {errors.form && (
              <div className="p-3 bg-[#FEF2F2] border border-[#FECACA] rounded-lg text-sm text-[#DC2626]">
                {errors.form}
              </div>
            )}

            {/* Beneficiary Information */}
            <div className="border border-[#E2E8F0] rounded-lg p-4 space-y-4">
              <h4 className="text-sm font-semibold text-[#0F172A]">Beneficiary Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#0F172A] mb-1.5">
                    Beneficiary Name <span className="text-[#DC2626]">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.beneficiaryName}
                    onChange={(e) => handleChange("beneficiaryName", e.target.value)}
                    className={`w-full px-3 py-2.5 text-sm border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition-all ${
                      errors.beneficiaryName ? "border-[#DC2626]" : "border-[#CBD5E1]"
                    }`}
                    placeholder="Beneficiary full name"
                  />
                  {errors.beneficiaryName && <p className="mt-1 text-xs text-[#DC2626]">{errors.beneficiaryName}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#0F172A] mb-1.5">
                    Beneficiary ID <span className="text-[#DC2626]">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.beneficiaryId}
                    onChange={(e) => handleChange("beneficiaryId", e.target.value)}
                    className={`w-full px-3 py-2.5 text-sm border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition-all ${
                      errors.beneficiaryId ? "border-[#DC2626]" : "border-[#CBD5E1]"
                    }`}
                    placeholder="National ID or Passport"
                  />
                  {errors.beneficiaryId && <p className="mt-1 text-xs text-[#DC2626]">{errors.beneficiaryId}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#0F172A] mb-1.5">Phone</label>
                  <input
                    type="text"
                    value={form.beneficiaryPhone}
                    onChange={(e) => handleChange("beneficiaryPhone", e.target.value)}
                    className="w-full px-3 py-2.5 text-sm border border-[#CBD5E1] rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition-all"
                    placeholder="Phone number"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#0F172A] mb-1.5">Email</label>
                  <input
                    type="email"
                    value={form.beneficiaryEmail}
                    onChange={(e) => handleChange("beneficiaryEmail", e.target.value)}
                    className={`w-full px-3 py-2.5 text-sm border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition-all ${
                      errors.beneficiaryEmail ? "border-[#DC2626]" : "border-[#CBD5E1]"
                    }`}
                    placeholder="email@example.com"
                  />
                  {errors.beneficiaryEmail && <p className="mt-1 text-xs text-[#DC2626]">{errors.beneficiaryEmail}</p>}
                </div>
              </div>
            </div>

            {/* Bank & Payment Information */}
            <div className="border border-[#E2E8F0] rounded-lg p-4 space-y-4">
              <h4 className="text-sm font-semibold text-[#0F172A]">Bank & Payment Details</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#0F172A] mb-1.5">
                    Bank Name <span className="text-[#DC2626]">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.bankName}
                    onChange={(e) => handleChange("bankName", e.target.value)}
                    className={`w-full px-3 py-2.5 text-sm border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition-all ${
                      errors.bankName ? "border-[#DC2626]" : "border-[#CBD5E1]"
                    }`}
                    placeholder="e.g. Bank of Kigali"
                  />
                  {errors.bankName && <p className="mt-1 text-xs text-[#DC2626]">{errors.bankName}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#0F172A] mb-1.5">
                    Account Number <span className="text-[#DC2626]">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.accountNumber}
                    onChange={(e) => handleChange("accountNumber", e.target.value)}
                    className={`w-full px-3 py-2.5 text-sm border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition-all ${
                      errors.accountNumber ? "border-[#DC2626]" : "border-[#CBD5E1]"
                    }`}
                    placeholder="Account number"
                  />
                  {errors.accountNumber && <p className="mt-1 text-xs text-[#DC2626]">{errors.accountNumber}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#0F172A] mb-1.5">
                    Amount (RWF) <span className="text-[#DC2626]">*</span>
                  </label>
                  <input
                    type="number"
                    value={form.amount}
                    onChange={(e) => handleChange("amount", e.target.value)}
                    className={`w-full px-3 py-2.5 text-sm border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition-all ${
                      errors.amount ? "border-[#DC2626]" : "border-[#CBD5E1]"
                    }`}
                    placeholder="e.g. 5000000"
                    min="0"
                    step="0.01"
                  />
                  {errors.amount && <p className="mt-1 text-xs text-[#DC2626]">{errors.amount}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#0F172A] mb-1.5">Payment Code</label>
                  <input
                    type="text"
                    value={form.paymentCode}
                    onChange={(e) => handleChange("paymentCode", e.target.value)}
                    className="w-full px-3 py-2.5 text-sm border border-[#CBD5E1] rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition-all"
                    placeholder="Transaction reference"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#0F172A] mb-1.5">Payment Date</label>
                  <input
                    type="date"
                    value={form.paidDate}
                    onChange={(e) => handleChange("paidDate", e.target.value)}
                    className="w-full px-3 py-2.5 text-sm border border-[#CBD5E1] rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-[#0F172A] mb-1.5">Notes</label>
              <textarea
                value={form.notes}
                onChange={(e) => handleChange("notes", e.target.value)}
                rows={3}
                className="w-full px-3 py-2.5 text-sm border border-[#CBD5E1] rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition-all resize-none"
                placeholder="Any additional notes about this payment..."
              />
              <p className="mt-1 text-xs text-[#94A3B8]">{form.notes.length}/2000</p>
            </div>

            {/* Submit */}
            <div className="flex items-center justify-end gap-3 pt-2 border-t border-[#E2E8F0]">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 text-sm font-medium text-[#64748B] border border-[#E2E8F0] rounded-lg hover:bg-[#F8FAFC] transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#1E3A8A] text-white text-sm font-semibold rounded-lg hover:bg-[#1D4ED8] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                {submitting ? "Recording..." : "Record Payment"}
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

// --- Update Payment Status Modal ---
export interface UpdatePaymentStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: UpdatePaymentFormData) => Promise<void>;
  currentStatus: string;
  currentPaymentCode?: string | null;
  beneficiaryName: string;
  amount: number;
}

export function UpdatePaymentStatusModal({
  isOpen,
  onClose,
  onSubmit,
  currentStatus,
  currentPaymentCode,
  beneficiaryName,
  amount,
}: UpdatePaymentStatusModalProps) {
  const [form, setForm] = useState({
    status: currentStatus,
    paymentCode: currentPaymentCode || "",
    paidDate: "",
    notes: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setForm({
        status: currentStatus,
        paymentCode: currentPaymentCode || "",
        paidDate: "",
        notes: "",
      });
      setErrors({});
    }
  }, [isOpen, currentStatus, currentPaymentCode]);

  if (!isOpen) return null;

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrors({});

    try {
      await onSubmit({
        status: form.status as PaymentStatus,
        paymentCode: form.paymentCode.trim() || undefined,
        paidDate: form.paidDate || undefined,
        notes: form.notes.trim() || undefined,
      });
      onClose();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to update payment";
      setErrors({ form: message });
    } finally {
      setSubmitting(false);
    }
  };

  const getAvailableStatuses = () => {
    if (currentStatus === "PENDING") {
      return STATUS_OPTIONS.filter((s) => s.value !== "PENDING");
    }
    if (currentStatus === "PAID") {
      return STATUS_OPTIONS.filter((s) => s.value === "PAID" || s.value === "CANCELLED");
    }
    if (currentStatus === "FAILED") {
      return STATUS_OPTIONS.filter((s) => s.value === "FAILED" || s.value === "PENDING");
    }
    // CANCELLED — cannot change
    return STATUS_OPTIONS.filter((s) => s.value === currentStatus);
  };

  const availableStatuses = getAvailableStatuses();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="flex flex-row items-center justify-between border-b border-[#E2E8F0] px-6 py-4">
          <CardTitle className="text-lg font-semibold text-[#0F172A]">
            Update Payment Status
          </CardTitle>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#64748B] hover:bg-[#F1F5F9] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Info */}
            <div className="p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg">
              <p className="text-xs font-medium text-[#64748B] uppercase tracking-wider">Beneficiary</p>
              <p className="mt-1 text-sm font-medium text-[#0F172A]">{beneficiaryName}</p>
              <p className="text-sm text-[#64748B] mt-1">
                Amount: {new Intl.NumberFormat("en-RW", { style: "currency", currency: "RWF", minimumFractionDigits: 0 }).format(amount)}
              </p>
            </div>

            {errors.form && (
              <div className="p-3 bg-[#FEF2F2] border border-[#FECACA] rounded-lg text-sm text-[#DC2626]">
                {errors.form}
              </div>
            )}

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-[#0F172A] mb-1.5">
                New Status <span className="text-[#DC2626]">*</span>
              </label>
              <select
                value={form.status}
                onChange={(e) => handleChange("status", e.target.value)}
                className={`w-full px-3 py-2.5 text-sm border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition-all ${
                  errors.status ? "border-[#DC2626]" : "border-[#CBD5E1]"
                }`}
              >
                {availableStatuses.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              {errors.status && <p className="mt-1 text-xs text-[#DC2626]">{errors.status}</p>}
              <p className="mt-1 text-xs text-[#94A3B8]">
                Current: {STATUS_OPTIONS.find((s) => s.value === currentStatus)?.label || currentStatus}
              </p>
            </div>

            {/* Payment Code */}
            <div>
              <label className="block text-sm font-medium text-[#0F172A] mb-1.5">Payment Code</label>
              <input
                type="text"
                value={form.paymentCode}
                onChange={(e) => handleChange("paymentCode", e.target.value)}
                className="w-full px-3 py-2.5 text-sm border border-[#CBD5E1] rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition-all"
                placeholder="Transaction reference"
              />
            </div>

            {/* Paid Date */}
            <div>
              <label className="block text-sm font-medium text-[#0F172A] mb-1.5">Payment Date</label>
              <input
                type="date"
                value={form.paidDate}
                onChange={(e) => handleChange("paidDate", e.target.value)}
                className="w-full px-3 py-2.5 text-sm border border-[#CBD5E1] rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition-all"
              />
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-[#0F172A] mb-1.5">Notes</label>
              <textarea
                value={form.notes}
                onChange={(e) => handleChange("notes", e.target.value)}
                rows={3}
                className="w-full px-3 py-2.5 text-sm border border-[#CBD5E1] rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition-all resize-none"
                placeholder="Additional notes..."
              />
            </div>

            {/* Submit */}
            <div className="flex items-center justify-end gap-3 pt-2 border-t border-[#E2E8F0]">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 text-sm font-medium text-[#64748B] border border-[#E2E8F0] rounded-lg hover:bg-[#F8FAFC] transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting || availableStatuses.length === 0}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#1E3A8A] text-white text-sm font-semibold rounded-lg hover:bg-[#1D4ED8] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                {submitting ? "Updating..." : "Update Payment"}
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

