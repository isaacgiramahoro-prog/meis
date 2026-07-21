"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { X, Loader2 } from "lucide-react";

// --- Types ---
export type CouncilDecision = "PENDING" | "APPROVED" | "REVISION_NEEDED";

export interface RecordCouncilData {
  papId: string;
  reviewerName: string;
  reviewDate?: string;
  decision: CouncilDecision;
  feedback?: string;
  approvedAmount?: number;
}

export interface RecordCouncilModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: RecordCouncilData) => Promise<void>;
  papId: string;
  papOwnerName: string;
  currentCompensationAmount: number | null;
  currentCompensationStatus: string;
}

const DECISION_OPTIONS = [
  { value: "APPROVED" as CouncilDecision, label: "Approved" },
  { value: "REVISION_NEEDED" as CouncilDecision, label: "Revision Needed" },
];

// --- Record Council Review Modal ---
export function RecordCouncilModal({
  isOpen,
  onClose,
  onSubmit,
  papId,
  papOwnerName,
  currentCompensationAmount,
  currentCompensationStatus,
}: RecordCouncilModalProps) {
  const [form, setForm] = useState({
    reviewerName: "",
    reviewDate: new Date().toISOString().split("T")[0],
    decision: "APPROVED" as CouncilDecision,
    feedback: "",
    approvedAmount: currentCompensationAmount?.toString() || "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setForm({
        reviewerName: "",
        reviewDate: new Date().toISOString().split("T")[0],
        decision: "APPROVED",
        feedback: "",
        approvedAmount: currentCompensationAmount?.toString() || "",
      });
      setErrors({});
    }
  }, [isOpen, currentCompensationAmount]);

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
      const submitData: RecordCouncilData = {
        papId,
        reviewerName: form.reviewerName.trim(),
        reviewDate: form.reviewDate,
        decision: form.decision,
        feedback: form.feedback.trim() || undefined,
        approvedAmount: form.approvedAmount
          ? parseFloat(form.approvedAmount)
          : undefined,
      };
      await onSubmit(submitData);
      onClose();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to record council review";
      setErrors({ form: message });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="flex flex-row items-center justify-between border-b border-[#E2E8F0] px-6 py-4">
          <CardTitle className="text-lg font-semibold text-[#0F172A]">
            Record Council Review
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
              <p className="text-xs font-medium text-[#64748B] uppercase tracking-wider">
                PAP
              </p>
              <p className="mt-1 text-sm font-medium text-[#0F172A]">{papOwnerName}</p>
              <p className="text-xs text-[#64748B] mt-1">
                Current Status:{" "}
                <span className="font-medium">{currentCompensationStatus}</span>
                {currentCompensationAmount && (
                  <>
                    {" | "}Amount:{" "}
                    <span className="font-medium">
                      {new Intl.NumberFormat("en-RW", {
                        style: "currency",
                        currency: "RWF",
                        minimumFractionDigits: 0,
                      }).format(currentCompensationAmount)}
                    </span>
                  </>
                )}
              </p>
            </div>

            {errors.form && (
              <div className="p-3 bg-[#FEF2F2] border border-[#FECACA] rounded-lg text-sm text-[#DC2626]">
                {errors.form}
              </div>
            )}

            {/* Reviewer Name */}
            <div>
              <label className="block text-sm font-medium text-[#0F172A] mb-1.5">
                Reviewer Name <span className="text-[#DC2626]">*</span>
              </label>
              <input
                type="text"
                value={form.reviewerName}
                onChange={(e) => handleChange("reviewerName", e.target.value)}
                className={`w-full px-3 py-2.5 text-sm border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition-all ${
                  errors.reviewerName ? "border-[#DC2626]" : "border-[#CBD5E1]"
                }`}
                placeholder="Council reviewer name"
              />
              {errors.reviewerName && (
                <p className="mt-1 text-xs text-[#DC2626]">{errors.reviewerName}</p>
              )}
            </div>

            {/* Review Date */}
            <div>
              <label className="block text-sm font-medium text-[#0F172A] mb-1.5">
                Review Date
              </label>
              <input
                type="date"
                value={form.reviewDate}
                onChange={(e) => handleChange("reviewDate", e.target.value)}
                className={`w-full px-3 py-2.5 text-sm border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition-all ${
                  errors.reviewDate ? "border-[#DC2626]" : "border-[#CBD5E1]"
                }`}
              />
              {errors.reviewDate && (
                <p className="mt-1 text-xs text-[#DC2626]">{errors.reviewDate}</p>
              )}
            </div>

            {/* Decision */}
            <div>
              <label className="block text-sm font-medium text-[#0F172A] mb-1.5">
                Decision <span className="text-[#DC2626]">*</span>
              </label>
              <select
                value={form.decision}
                onChange={(e) => handleChange("decision", e.target.value)}
                className={`w-full px-3 py-2.5 text-sm border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition-all ${
                  errors.decision ? "border-[#DC2626]" : "border-[#CBD5E1]"
                }`}
              >
                {DECISION_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              {errors.decision && (
                <p className="mt-1 text-xs text-[#DC2626]">{errors.decision}</p>
              )}
            </div>

            {/* Approved Amount (shown when APPROVED) */}
            {form.decision === "APPROVED" && (
              <div>
                <label className="block text-sm font-medium text-[#0F172A] mb-1.5">
                  Approved Amount (RWF)
                </label>
                <input
                  type="number"
                  min="0"
                  value={form.approvedAmount}
                  onChange={(e) => handleChange("approvedAmount", e.target.value)}
                  className={`w-full px-3 py-2.5 text-sm border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition-all ${
                    errors.approvedAmount ? "border-[#DC2626]" : "border-[#CBD5E1]"
                  }`}
                  placeholder="e.g., 5000000"
                />
                {errors.approvedAmount && (
                  <p className="mt-1 text-xs text-[#DC2626]">
                    {errors.approvedAmount}
                  </p>
                )}
                <p className="mt-1 text-xs text-[#94A3B8]">
                  Leave empty to keep current compensation amount
                </p>
              </div>
            )}

            {/* Feedback */}
            <div>
              <label className="block text-sm font-medium text-[#0F172A] mb-1.5">
                Feedback / Comments
              </label>
              <textarea
                value={form.feedback}
                onChange={(e) => handleChange("feedback", e.target.value)}
                rows={3}
                className={`w-full px-3 py-2.5 text-sm border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition-all resize-none ${
                  errors.feedback ? "border-[#DC2626]" : "border-[#CBD5E1]"
                }`}
                placeholder={
                  form.decision === "APPROVED"
                    ? "Optional approval notes..."
                    : "Describe what revisions are needed..."
                }
              />
              {errors.feedback && (
                <p className="mt-1 text-xs text-[#DC2626]">{errors.feedback}</p>
              )}
              <p className="mt-1 text-xs text-[#94A3B8]">
                {form.feedback.length}/1000
              </p>
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
                {submitting
                  ? "Recording..."
                  : form.decision === "APPROVED"
                  ? "Approve & Move to Finance"
                  : "Request Revision"}
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

