"use client";

import { useState, useEffect } from "react";
import { X, Loader2 } from "lucide-react";
import { FinanceDecision } from "@/lib/validations";

// --- Record Finance Review Modal ---

interface RecordFinanceReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  papId: string;
  projectId: string;
  currentAmount: number | null;
  onSubmit: (data: {
    papId: string;
    projectId: string;
    reviewerName: string;
    reviewDate: string;
    decision: FinanceDecision;
    feedback: string;
    approvedAmount: number | null;
  }) => Promise<void>;
}

const FINANCE_DECISIONS: { value: FinanceDecision; label: string }[] = [
  { value: "APPROVED", label: "Approved" },
  { value: "DECLINED", label: "Declined" },
  { value: "REVISION_NEEDED", label: "Revision Needed" },
];

export function RecordFinanceReviewModal({
  isOpen,
  onClose,
  papId,
  projectId,
  currentAmount,
  onSubmit,
}: RecordFinanceReviewModalProps) {
  const [reviewerName, setReviewerName] = useState("");
  const [reviewDate, setReviewDate] = useState(new Date().toISOString().split("T")[0]);
  const [decision, setDecision] = useState<FinanceDecision>("APPROVED");
  const [feedback, setFeedback] = useState("");
  const [approvedAmount, setApprovedAmount] = useState<string>(
    currentAmount ? currentAmount.toString() : ""
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setReviewerName("");
      setReviewDate(new Date().toISOString().split("T")[0]);
      setDecision("APPROVED");
      setFeedback("");
      setApprovedAmount(currentAmount ? currentAmount.toString() : "");
      setErrors({});
    }
  }, [isOpen, currentAmount]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Basic validation
    const newErrors: Record<string, string> = {};
    if (!reviewerName.trim()) newErrors.reviewerName = "Reviewer name is required";
    if (!decision) newErrors.decision = "Decision is required";
    if (decision === "APPROVED" && !approvedAmount) {
      newErrors.approvedAmount = "Approved amount is required when approving";
    }
    if (!reviewDate) newErrors.reviewDate = "Review date is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit({
        papId,
        projectId,
        reviewerName: reviewerName.trim(),
        reviewDate: new Date(reviewDate).toISOString(),
        decision,
        feedback: feedback.trim(),
        approvedAmount: approvedAmount ? parseFloat(approvedAmount) : null,
      });
      onClose();
    } catch (err) {
      setErrors({ submit: err instanceof Error ? err.message : "An error occurred" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#E2E8F0]">
          <h2 className="text-lg font-bold text-[#0F172A]">Record Finance Review Decision</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#64748B] hover:bg-[#F1F5F9] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Reviewer Name */}
          <div>
            <label className="block text-sm font-medium text-[#0F172A] mb-1.5">
              Reviewer Name <span className="text-[#DC2626]">*</span>
            </label>
            <input
              type="text"
              value={reviewerName}
              onChange={(e) => setReviewerName(e.target.value)}
              className={`w-full px-3 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-[#2563EB] transition-colors ${
                errors.reviewerName ? "border-[#DC2626]" : "border-[#CBD5E1]"
              }`}
              placeholder="Enter reviewer name"
            />
            {errors.reviewerName && (
              <p className="mt-1 text-xs text-[#DC2626]">{errors.reviewerName}</p>
            )}
          </div>

          {/* Review Date */}
          <div>
            <label className="block text-sm font-medium text-[#0F172A] mb-1.5">
              Review Date <span className="text-[#DC2626]">*</span>
            </label>
            <input
              type="date"
              value={reviewDate}
              onChange={(e) => setReviewDate(e.target.value)}
              className={`w-full px-3 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-[#2563EB] transition-colors ${
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
            <div className="grid grid-cols-1 gap-2">
              {FINANCE_DECISIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setDecision(opt.value)}
                  className={`px-4 py-2.5 text-sm font-medium rounded-lg border text-left transition-colors ${
                    decision === opt.value
                      ? opt.value === "APPROVED"
                        ? "bg-[#DCFCE7] border-[#16A34A] text-[#16A34A]"
                        : opt.value === "DECLINED"
                        ? "bg-[#FEE2E2] border-[#DC2626] text-[#DC2626]"
                        : "bg-[#FEF9C3] border-[#EAB308] text-[#EAB308]"
                      : "bg-white border-[#E2E8F0] text-[#64748B] hover:border-[#CBD5E1]"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            {errors.decision && (
              <p className="mt-1 text-xs text-[#DC2626]">{errors.decision}</p>
            )}
          </div>

          {/* Approved Amount (shown when APPROVED) */}
          {decision === "APPROVED" && (
            <div>
              <label className="block text-sm font-medium text-[#0F172A] mb-1.5">
                Approved Amount (RWF) <span className="text-[#DC2626]">*</span>
              </label>
              <input
                type="number"
                value={approvedAmount}
                onChange={(e) => setApprovedAmount(e.target.value)}
                className={`w-full px-3 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-[#2563EB] transition-colors ${
                  errors.approvedAmount ? "border-[#DC2626]" : "border-[#CBD5E1]"
                }`}
                placeholder="e.g. 5000000"
              />
              {errors.approvedAmount && (
                <p className="mt-1 text-xs text-[#DC2626]">{errors.approvedAmount}</p>
              )}
            </div>
          )}

          {/* Feedback */}
          <div>
            <label className="block text-sm font-medium text-[#0F172A] mb-1.5">
              Feedback / Comments
            </label>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              rows={4}
              className="w-full px-3 py-2.5 text-sm border border-[#CBD5E1] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-[#2563EB] transition-colors resize-none"
              placeholder="Enter any feedback or comments..."
            />
          </div>

          {/* Submit error */}
          {errors.submit && (
            <div className="p-3 bg-[#FEE2E2] text-[#DC2626] text-sm rounded-lg border border-[#FECACA]">
              {errors.submit}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
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
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold bg-[#1E3A8A] text-white rounded-lg hover:bg-[#1D4ED8] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
              {submitting ? "Recording..." : "Record Decision"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

