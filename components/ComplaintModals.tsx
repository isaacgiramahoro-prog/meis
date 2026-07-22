"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { X, Loader2 } from "lucide-react";

// --- Types ---
export type ComplaintCategory = "LAND_ISSUE" | "VALUATION_ISSUE" | "OWNERSHIP_ISSUE" | "PAYMENT_ISSUE" | "OTHER";

export interface CreateComplaintFormData {
  papId: string;
  projectId: string;
  category: ComplaintCategory;
  description: string;
  parentComplaintId?: string;
}

export interface UpdateComplaintFormData {
  status: "SUBMITTED" | "UNDER_REVIEW" | "RESOLVED" | "REJECTED";
  resolution: string;
}

const CATEGORY_OPTIONS: { value: ComplaintCategory; label: string }[] = [
  { value: "LAND_ISSUE", label: "Land Issue" },
  { value: "VALUATION_ISSUE", label: "Valuation Issue" },
  { value: "OWNERSHIP_ISSUE", label: "Ownership Issue" },
  { value: "PAYMENT_ISSUE", label: "Payment Issue" },
  { value: "OTHER", label: "Other" },
];

const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: "SUBMITTED", label: "Submitted" },
  { value: "UNDER_REVIEW", label: "Under Review" },
  { value: "RESOLVED", label: "Resolved" },
  { value: "REJECTED", label: "Rejected" },
];

// --- Create Complaint Modal ---
export interface CreateComplaintModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateComplaintFormData) => Promise<void>;
  papId: string;
  projectId: string;
  papOwnerName: string;
  parentComplaintId?: string;
}

export function CreateComplaintModal({
  isOpen,
  onClose,
  onSubmit,
  papId,
  projectId,
  papOwnerName,
  parentComplaintId,
}: CreateComplaintModalProps) {
  const [form, setForm] = useState({
    category: "LAND_ISSUE" as ComplaintCategory,
    description: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setForm({
        category: "LAND_ISSUE",
        description: "",
      });
      setErrors({});
    }
  }, [isOpen]);

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
      if (!form.description || form.description.trim().length < 10) {
        throw new Error("Description must be at least 10 characters");
      }

      await onSubmit({
        papId,
        projectId,
        category: form.category,
        description: form.description.trim(),
        parentComplaintId,
      });
      onClose();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to create complaint";
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
            {parentComplaintId ? "File Appeal Complaint" : "Register Complaint"}
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
              <p className="text-xs font-medium text-[#64748B] uppercase tracking-wider">PAP</p>
              <p className="mt-1 text-sm font-medium text-[#0F172A]">{papOwnerName}</p>
            </div>

            {parentComplaintId && (
              <div className="p-3 bg-[#FEF9C3] border border-[#FDE68A] rounded-lg">
                <p className="text-xs font-medium text-[#EAB308] uppercase tracking-wider">Appeal</p>
                <p className="mt-1 text-sm text-[#0F172A]">
                  This complaint will be linked as an appeal to the previous complaint.
                </p>
              </div>
            )}

            {errors.form && (
              <div className="p-3 bg-[#FEF2F2] border border-[#FECACA] rounded-lg text-sm text-[#DC2626]">
                {errors.form}
              </div>
            )}

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-[#0F172A] mb-1.5">
                Complaint Category <span className="text-[#DC2626]">*</span>
              </label>
              <select
                value={form.category}
                onChange={(e) => handleChange("category", e.target.value)}
                className={`w-full px-3 py-2.5 text-sm border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition-all ${
                  errors.category ? "border-[#DC2626]" : "border-[#CBD5E1]"
                }`}
              >
                {CATEGORY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              {errors.category && <p className="mt-1 text-xs text-[#DC2626]">{errors.category}</p>}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-[#0F172A] mb-1.5">
                Description <span className="text-[#DC2626]">*</span>
              </label>
              <textarea
                value={form.description}
                onChange={(e) => handleChange("description", e.target.value)}
                rows={4}
                className={`w-full px-3 py-2.5 text-sm border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition-all resize-none ${
                  errors.description ? "border-[#DC2626]" : "border-[#CBD5E1]"
                }`}
                placeholder="Describe the complaint in detail..."
              />
              {errors.description && (
                <p className="mt-1 text-xs text-[#DC2626]">{errors.description}</p>
              )}
              <p className="mt-1 text-xs text-[#94A3B8]">{form.description.length}/2000</p>
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
                  ? "Submitting..."
                  : parentComplaintId
                  ? "File Appeal"
                  : "Submit Complaint"}
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

// --- Update Complaint Status Modal ---
export interface UpdateComplaintStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: UpdateComplaintFormData) => Promise<void>;
  currentStatus: string;
  complaintDescription: string;
  papOwnerName: string;
}

export function UpdateComplaintStatusModal({
  isOpen,
  onClose,
  onSubmit,
  currentStatus,
  complaintDescription,
  papOwnerName,
}: UpdateComplaintStatusModalProps) {
  const [form, setForm] = useState({
    status: currentStatus,
    resolution: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setForm({
        status: currentStatus === "SUBMITTED" ? "UNDER_REVIEW" : currentStatus,
        resolution: "",
      });
      setErrors({});
    }
  }, [isOpen, currentStatus]);

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
      if ((form.status === "RESOLVED" || form.status === "REJECTED") && (!form.resolution || form.resolution.trim().length < 10)) {
        throw new Error(
          form.status === "RESOLVED"
            ? "Please provide a resolution description (min 10 characters)"
            : "Please provide a rejection reason (min 10 characters)"
        );
      }

      await onSubmit({
        status: form.status as UpdateComplaintFormData["status"],
        resolution: form.resolution.trim(),
      });
      onClose();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to update complaint";
      setErrors({ form: message });
    } finally {
      setSubmitting(false);
    }
  };

  const getAvailableStatuses = () => {
    if (currentStatus === "SUBMITTED") {
      return STATUS_OPTIONS.filter((s) => s.value !== "SUBMITTED");
    }
    if (currentStatus === "UNDER_REVIEW") {
      return STATUS_OPTIONS.filter((s) => s.value === "RESOLVED" || s.value === "REJECTED");
    }
    return [];
  };

  const availableStatuses = getAvailableStatuses();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="flex flex-row items-center justify-between border-b border-[#E2E8F0] px-6 py-4">
          <CardTitle className="text-lg font-semibold text-[#0F172A]">
            Update Complaint Status
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
              <p className="text-xs font-medium text-[#64748B] uppercase tracking-wider">PAP</p>
              <p className="mt-1 text-sm font-medium text-[#0F172A]">{papOwnerName}</p>
              <p className="text-xs text-[#64748B] mt-2 line-clamp-2">{complaintDescription}</p>
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

            {/* Resolution / Reason */}
            {(form.status === "RESOLVED" || form.status === "REJECTED") && (
              <div>
                <label className="block text-sm font-medium text-[#0F172A] mb-1.5">
                  {form.status === "RESOLVED" ? "Resolution Description" : "Rejection Reason"}{" "}
                  <span className="text-[#DC2626]">*</span>
                </label>
                <textarea
                  value={form.resolution}
                  onChange={(e) => handleChange("resolution", e.target.value)}
                  rows={4}
                  className={`w-full px-3 py-2.5 text-sm border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition-all resize-none ${
                    errors.resolution ? "border-[#DC2626]" : "border-[#CBD5E1]"
                  }`}
                  placeholder={
                    form.status === "RESOLVED"
                      ? "Describe how the complaint was resolved..."
                      : "Explain why the complaint is being rejected..."
                  }
                />
                {errors.resolution && (
                  <p className="mt-1 text-xs text-[#DC2626]">{errors.resolution}</p>
                )}
                <p className="mt-1 text-xs text-[#94A3B8]">{form.resolution.length}/2000</p>
              </div>
            )}

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
                {submitting
                  ? "Updating..."
                  : form.status === "RESOLVED"
                  ? "Resolve Complaint"
                  : form.status === "REJECTED"
                  ? "Reject Complaint"
                  : "Update Status"}
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

