"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { X, Loader2 } from "lucide-react";

// --- Types ---
export interface PapFormData {
  projectId: string;
  ownerName: string;
  ownerId: string;
  ownerPhone?: string;
  ownerEmail?: string;
  civilStatus?: string;
  beneficiaryName: string;
  beneficiaryId: string;
  beneficiaryPhone?: string;
  beneficiaryEmail?: string;
  relationship?: string;
  affectedUpi: string;
  affectedArea: number;
  propertyType: string;
  sector: string;
  cell: string;
  village: string;
  landRegistration?: string;
  landDescription?: string;
  compensationAmount?: number;
  valuationDate?: string;
  valuationComment?: string;
  bankName?: string;
  accountNumber?: string;
}

export interface CreatePapModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: PapFormData) => Promise<void>;
  projects: { id: string; name: string; location: string }[];
}

// --- Create PAP Modal ---
export function CreatePapModal({ isOpen, onClose, onSubmit, projects }: CreatePapModalProps) {
  const [form, setForm] = useState<PapFormData>({
    projectId: "",
    ownerName: "",
    ownerId: "",
    ownerPhone: "",
    ownerEmail: "",
    civilStatus: "",
    beneficiaryName: "",
    beneficiaryId: "",
    beneficiaryPhone: "",
    beneficiaryEmail: "",
    relationship: "",
    affectedUpi: "",
    affectedArea: 0,
    propertyType: "RESIDENTIAL",
    sector: "",
    cell: "",
    village: "",
    landRegistration: "",
    landDescription: "",
    compensationAmount: undefined,
    valuationDate: "",
    valuationComment: "",
    bankName: "",
    accountNumber: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setForm({
        projectId: "",
        ownerName: "",
        ownerId: "",
        ownerPhone: "",
        ownerEmail: "",
        civilStatus: "",
        beneficiaryName: "",
        beneficiaryId: "",
        beneficiaryPhone: "",
        beneficiaryEmail: "",
        relationship: "",
        affectedUpi: "",
        affectedArea: 0,
        propertyType: "RESIDENTIAL",
        sector: "",
        cell: "",
        village: "",
        landRegistration: "",
        landDescription: "",
        compensationAmount: undefined,
        valuationDate: "",
        valuationComment: "",
        bankName: "",
        accountNumber: "",
      });
      setErrors({});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleChange = (field: keyof PapFormData, value: string | number | undefined) => {
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
      await onSubmit(form);
      onClose();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to create PAP";
      setErrors({ form: message });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between border-b border-[#E2E8F0] px-6 py-4">
          <CardTitle className="text-lg font-semibold text-[#0F172A]">Register New PAP</CardTitle>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#64748B] hover:bg-[#F1F5F9] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {errors.form && (
              <div className="p-3 bg-[#FEF2F2] border border-[#FECACA] rounded-lg text-sm text-[#DC2626]">
                {errors.form}
              </div>
            )}

            {/* Project Selection */}
            <div>
              <label className="block text-sm font-medium text-[#0F172A] mb-1.5">
                Project <span className="text-[#DC2626]">*</span>
              </label>
              <select
                value={form.projectId}
                onChange={(e) => handleChange("projectId", e.target.value)}
                className={`w-full px-3 py-2.5 text-sm border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition-all ${
                  errors.projectId ? "border-[#DC2626]" : "border-[#CBD5E1]"
                }`}
              >
                <option value="">-- Select a project --</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.location})
                  </option>
                ))}
              </select>
              {errors.projectId && <p className="mt-1 text-xs text-[#DC2626]">{errors.projectId}</p>}
            </div>

            {/* Owner Information */}
            <div>
              <h3 className="text-sm font-semibold text-[#0F172A] mb-3 pb-2 border-b border-[#E2E8F0]">
                Owner Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#0F172A] mb-1.5">
                    Owner Name <span className="text-[#DC2626]">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.ownerName}
                    onChange={(e) => handleChange("ownerName", e.target.value)}
                    className={`w-full px-3 py-2.5 text-sm border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition-all ${
                      errors.ownerName ? "border-[#DC2626]" : "border-[#CBD5E1]"
                    }`}
                    placeholder="Full name"
                  />
                  {errors.ownerName && <p className="mt-1 text-xs text-[#DC2626]">{errors.ownerName}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#0F172A] mb-1.5">
                    Owner ID <span className="text-[#DC2626]">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.ownerId}
                    onChange={(e) => handleChange("ownerId", e.target.value)}
                    className={`w-full px-3 py-2.5 text-sm border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition-all ${
                      errors.ownerId ? "border-[#DC2626]" : "border-[#CBD5E1]"
                    }`}
                    placeholder="National ID number"
                  />
                  {errors.ownerId && <p className="mt-1 text-xs text-[#DC2626]">{errors.ownerId}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#0F172A] mb-1.5">Phone</label>
                  <input
                    type="text"
                    value={form.ownerPhone}
                    onChange={(e) => handleChange("ownerPhone", e.target.value)}
                    className="w-full px-3 py-2.5 text-sm border border-[#CBD5E1] rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition-all"
                    placeholder="Phone number"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#0F172A] mb-1.5">Email</label>
                  <input
                    type="email"
                    value={form.ownerEmail}
                    onChange={(e) => handleChange("ownerEmail", e.target.value)}
                    className="w-full px-3 py-2.5 text-sm border border-[#CBD5E1] rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition-all"
                    placeholder="Email address"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#0F172A] mb-1.5">Civil Status</label>
                  <select
                    value={form.civilStatus}
                    onChange={(e) => handleChange("civilStatus", e.target.value)}
                    className="w-full px-3 py-2.5 text-sm border border-[#CBD5E1] rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition-all"
                  >
                    <option value="">-- Select --</option>
                    <option value="Single">Single</option>
                    <option value="Married">Married</option>
                    <option value="Divorced">Divorced</option>
                    <option value="Widowed">Widowed</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Beneficiary Information */}
            <div>
              <h3 className="text-sm font-semibold text-[#0F172A] mb-3 pb-2 border-b border-[#E2E8F0]">
                Beneficiary Information
              </h3>
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
                    placeholder="Full name"
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
                    placeholder="National ID number"
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
                    className="w-full px-3 py-2.5 text-sm border border-[#CBD5E1] rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition-all"
                    placeholder="Email address"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#0F172A] mb-1.5">Relationship to Owner</label>
                  <input
                    type="text"
                    value={form.relationship}
                    onChange={(e) => handleChange("relationship", e.target.value)}
                    className="w-full px-3 py-2.5 text-sm border border-[#CBD5E1] rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition-all"
                    placeholder="e.g., Spouse, Child"
                  />
                </div>
              </div>
            </div>

            {/* Land Information */}
            <div>
              <h3 className="text-sm font-semibold text-[#0F172A] mb-3 pb-2 border-b border-[#E2E8F0]">
                Land Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#0F172A] mb-1.5">
                    Affected UPI <span className="text-[#DC2626]">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.affectedUpi}
                    onChange={(e) => handleChange("affectedUpi", e.target.value)}
                    className={`w-full px-3 py-2.5 text-sm border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition-all ${
                      errors.affectedUpi ? "border-[#DC2626]" : "border-[#CBD5E1]"
                    }`}
                    placeholder="Unique Parcel Identifier"
                  />
                  {errors.affectedUpi && <p className="mt-1 text-xs text-[#DC2626]">{errors.affectedUpi}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#0F172A] mb-1.5">
                    Affected Area (m²) <span className="text-[#DC2626]">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.affectedArea || ""}
                    onChange={(e) => handleChange("affectedArea", parseFloat(e.target.value) || 0)}
                    className={`w-full px-3 py-2.5 text-sm border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition-all ${
                      errors.affectedArea ? "border-[#DC2626]" : "border-[#CBD5E1]"
                    }`}
                    placeholder="e.g., 500"
                  />
                  {errors.affectedArea && <p className="mt-1 text-xs text-[#DC2626]">{errors.affectedArea}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#0F172A] mb-1.5">
                    Property Type <span className="text-[#DC2626]">*</span>
                  </label>
                  <select
                    value={form.propertyType}
                    onChange={(e) => handleChange("propertyType", e.target.value)}
                    className={`w-full px-3 py-2.5 text-sm border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition-all ${
                      errors.propertyType ? "border-[#DC2626]" : "border-[#CBD5E1]"
                    }`}
                  >
                    <option value="RESIDENTIAL">Residential</option>
                    <option value="COMMERCIAL">Commercial</option>
                    <option value="AGRICULTURAL">Agricultural</option>
                    <option value="INDUSTRIAL">Industrial</option>
                    <option value="OTHER">Other</option>
                  </select>
                  {errors.propertyType && <p className="mt-1 text-xs text-[#DC2626]">{errors.propertyType}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#0F172A] mb-1.5">
                    Sector <span className="text-[#DC2626]">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.sector}
                    onChange={(e) => handleChange("sector", e.target.value)}
                    className={`w-full px-3 py-2.5 text-sm border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition-all ${
                      errors.sector ? "border-[#DC2626]" : "border-[#CBD5E1]"
                    }`}
                    placeholder="Sector name"
                  />
                  {errors.sector && <p className="mt-1 text-xs text-[#DC2626]">{errors.sector}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#0F172A] mb-1.5">
                    Cell <span className="text-[#DC2626]">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.cell}
                    onChange={(e) => handleChange("cell", e.target.value)}
                    className={`w-full px-3 py-2.5 text-sm border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition-all ${
                      errors.cell ? "border-[#DC2626]" : "border-[#CBD5E1]"
                    }`}
                    placeholder="Cell name"
                  />
                  {errors.cell && <p className="mt-1 text-xs text-[#DC2626]">{errors.cell}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#0F172A] mb-1.5">
                    Village <span className="text-[#DC2626]">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.village}
                    onChange={(e) => handleChange("village", e.target.value)}
                    className={`w-full px-3 py-2.5 text-sm border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition-all ${
                      errors.village ? "border-[#DC2626]" : "border-[#CBD5E1]"
                    }`}
                    placeholder="Village name"
                  />
                  {errors.village && <p className="mt-1 text-xs text-[#DC2626]">{errors.village}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#0F172A] mb-1.5">Land Registration</label>
                  <input
                    type="text"
                    value={form.landRegistration}
                    onChange={(e) => handleChange("landRegistration", e.target.value)}
                    className="w-full px-3 py-2.5 text-sm border border-[#CBD5E1] rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition-all"
                    placeholder="Registration number"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-[#0F172A] mb-1.5">Land Description</label>
                  <textarea
                    value={form.landDescription}
                    onChange={(e) => handleChange("landDescription", e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2.5 text-sm border border-[#CBD5E1] rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition-all resize-none"
                    placeholder="Optional description of the land..."
                  />
                </div>
              </div>
            </div>

            {/* Valuation (Optional at creation) */}
            <div>
              <h3 className="text-sm font-semibold text-[#0F172A] mb-3 pb-2 border-b border-[#E2E8F0]">
                Valuation (Optional)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#0F172A] mb-1.5">
                    Compensation Amount (RWF)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={form.compensationAmount || ""}
                    onChange={(e) => handleChange("compensationAmount", e.target.value ? parseFloat(e.target.value) : undefined)}
                    className="w-full px-3 py-2.5 text-sm border border-[#CBD5E1] rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition-all"
                    placeholder="e.g., 5000000"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#0F172A] mb-1.5">Valuation Date</label>
                  <input
                    type="date"
                    value={form.valuationDate}
                    onChange={(e) => handleChange("valuationDate", e.target.value)}
                    className="w-full px-3 py-2.5 text-sm border border-[#CBD5E1] rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition-all"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-[#0F172A] mb-1.5">Valuation Comment</label>
                  <textarea
                    value={form.valuationComment}
                    onChange={(e) => handleChange("valuationComment", e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2.5 text-sm border border-[#CBD5E1] rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition-all resize-none"
                    placeholder="Optional comment about the valuation..."
                  />
                </div>
              </div>
            </div>

            {/* Bank Information (Optional) */}
            <div>
              <h3 className="text-sm font-semibold text-[#0F172A] mb-3 pb-2 border-b border-[#E2E8F0]">
                Bank Information (Optional)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#0F172A] mb-1.5">Bank Name</label>
                  <input
                    type="text"
                    value={form.bankName}
                    onChange={(e) => handleChange("bankName", e.target.value)}
                    className="w-full px-3 py-2.5 text-sm border border-[#CBD5E1] rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition-all"
                    placeholder="Bank name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#0F172A] mb-1.5">Account Number</label>
                  <input
                    type="text"
                    value={form.accountNumber}
                    onChange={(e) => handleChange("accountNumber", e.target.value)}
                    className="w-full px-3 py-2.5 text-sm border border-[#CBD5E1] rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition-all"
                    placeholder="Account number"
                  />
                </div>
              </div>
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
                {submitting ? "Registering..." : "Register PAP"}
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

// --- Valuation Modal ---
export interface ValuationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    compensationAmount?: number | null;
    valuationDate?: string | null;
    valuationComment?: string | null;
    compensationStatus?: string;
  }) => Promise<void>;
  currentValues: {
    compensationAmount: number | null;
    valuationDate: string | null;
    valuationComment: string | null;
    compensationStatus: string;
  };
}

const STATUS_OPTIONS = [
  { value: "DRAFT", label: "Draft" },
  { value: "NOT_YET_PAID", label: "Not Yet Paid" },
  { value: "COUNCIL_REVIEW", label: "Council Review" },
  { value: "FINANCE_PROCESSING", label: "Finance Processing" },
  { value: "PAID", label: "Paid" },
  { value: "FAILED", label: "Failed" },
  { value: "CANCELLED", label: "Cancelled" },
];

export function ValuationModal({ isOpen, onClose, onSubmit, currentValues }: ValuationModalProps) {
  const [form, setForm] = useState({
    compensationAmount: "",
    valuationDate: "",
    valuationComment: "",
    compensationStatus: "DRAFT",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen && currentValues) {
      setForm({
        compensationAmount: currentValues.compensationAmount?.toString() || "",
        valuationDate: currentValues.valuationDate
          ? new Date(currentValues.valuationDate).toISOString().split("T")[0]
          : "",
        valuationComment: currentValues.valuationComment || "",
        compensationStatus: currentValues.compensationStatus || "DRAFT",
      });
      setErrors({});
    }
  }, [isOpen, currentValues]);

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
      const submitData: {
        compensationAmount?: number | null;
        valuationDate?: string | null;
        valuationComment?: string | null;
        compensationStatus?: string;
      } = {
        compensationAmount: form.compensationAmount ? parseFloat(form.compensationAmount) : null,
        valuationDate: form.valuationDate || null,
        valuationComment: form.valuationComment || null,
        compensationStatus: form.compensationStatus,
      };
      await onSubmit(submitData);
      onClose();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to update valuation";
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
            Update Valuation / Compensation
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
            {errors.form && (
              <div className="p-3 bg-[#FEF2F2] border border-[#FECACA] rounded-lg text-sm text-[#DC2626]">
                {errors.form}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-[#0F172A] mb-1.5">
                Compensation Status
              </label>
              <select
                value={form.compensationStatus}
                onChange={(e) => handleChange("compensationStatus", e.target.value)}
                className="w-full px-3 py-2.5 text-sm border border-[#CBD5E1] rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition-all"
              >
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#0F172A] mb-1.5">
                Compensation Amount (RWF)
              </label>
              <input
                type="number"
                min="0"
                value={form.compensationAmount}
                onChange={(e) => handleChange("compensationAmount", e.target.value)}
                className={`w-full px-3 py-2.5 text-sm border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition-all ${
                  errors.compensationAmount ? "border-[#DC2626]" : "border-[#CBD5E1]"
                }`}
                placeholder="e.g., 5000000"
              />
              {errors.compensationAmount && (
                <p className="mt-1 text-xs text-[#DC2626]">{errors.compensationAmount}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-[#0F172A] mb-1.5">Valuation Date</label>
              <input
                type="date"
                value={form.valuationDate}
                onChange={(e) => handleChange("valuationDate", e.target.value)}
                className={`w-full px-3 py-2.5 text-sm border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition-all ${
                  errors.valuationDate ? "border-[#DC2626]" : "border-[#CBD5E1]"
                }`}
              />
              {errors.valuationDate && (
                <p className="mt-1 text-xs text-[#DC2626]">{errors.valuationDate}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-[#0F172A] mb-1.5">Valuation Comment</label>
              <textarea
                value={form.valuationComment}
                onChange={(e) => handleChange("valuationComment", e.target.value)}
                rows={3}
                className={`w-full px-3 py-2.5 text-sm border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition-all resize-none ${
                  errors.valuationComment ? "border-[#DC2626]" : "border-[#CBD5E1]"
                }`}
                placeholder="Add a comment or reason for this valuation update..."
              />
              {errors.valuationComment && (
                <p className="mt-1 text-xs text-[#DC2626]">{errors.valuationComment}</p>
              )}
              <p className="mt-1 text-xs text-[#94A3B8]">{form.valuationComment.length}/500</p>
            </div>

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
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#1E3A8A] text-white text-sm font-semibold rounded-lg hover:bg-[#1D4ED8] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                {submitting ? "Updating..." : "Update Valuation"}
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

