"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, Loader2 } from "lucide-react";

// --- Types ---
export interface UserOption {
  id: string;
  name: string;
  email: string;
}

export interface ProjectFormData {
  name: string;
  location: string;
  budget: string;
  deadline: string;
  description: string;
}

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// --- Create Project Modal ---
interface CreateProjectModalProps extends ModalProps {
  onSubmit: (data: ProjectFormData) => Promise<void>;
}

export function CreateProjectModal({ isOpen, onClose, onSubmit }: CreateProjectModalProps) {
  const [form, setForm] = useState<ProjectFormData>({
    name: "",
    location: "",
    budget: "",
    deadline: "",
    description: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setForm({ name: "", location: "", budget: "", deadline: "", description: "" });
      setErrors({});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleChange = (field: keyof ProjectFormData, value: string) => {
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
      const message = err instanceof Error ? err.message : "Failed to create project";
      setErrors({ form: message });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between border-b border-[#E2E8F0] px-6 py-4">
          <CardTitle className="text-lg font-semibold text-[#0F172A]">Create New Project</CardTitle>
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
                Project Name <span className="text-[#DC2626]">*</span>
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => handleChange("name", e.target.value)}
                className={`w-full px-3 py-2.5 text-sm border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition-all placeholder:text-[#94A3B8] ${
                  errors.name ? "border-[#DC2626]" : "border-[#CBD5E1]"
                }`}
                placeholder="e.g., Kigali Road Expansion Phase 2"
              />
              {errors.name && (
                <p className="mt-1 text-xs text-[#DC2626]">{errors.name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-[#0F172A] mb-1.5">
                Location <span className="text-[#DC2626]">*</span>
              </label>
              <input
                type="text"
                value={form.location}
                onChange={(e) => handleChange("location", e.target.value)}
                className={`w-full px-3 py-2.5 text-sm border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition-all placeholder:text-[#94A3B8] ${
                  errors.location ? "border-[#DC2626]" : "border-[#CBD5E1]"
                }`}
                placeholder="e.g., Nyanza District, Sector A"
              />
              {errors.location && (
                <p className="mt-1 text-xs text-[#DC2626]">{errors.location}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#0F172A] mb-1.5">
                  Budget (RWF) <span className="text-[#DC2626]">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  value={form.budget}
                  onChange={(e) => handleChange("budget", e.target.value)}
                  className={`w-full px-3 py-2.5 text-sm border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition-all placeholder:text-[#94A3B8] ${
                    errors.budget ? "border-[#DC2626]" : "border-[#CBD5E1]"
                  }`}
                  placeholder="e.g., 250000000"
                />
                {errors.budget && (
                  <p className="mt-1 text-xs text-[#DC2626]">{errors.budget}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-[#0F172A] mb-1.5">
                  Deadline <span className="text-[#DC2626]">*</span>
                </label>
                <input
                  type="date"
                  value={form.deadline}
                  onChange={(e) => handleChange("deadline", e.target.value)}
                  className={`w-full px-3 py-2.5 text-sm border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition-all ${
                    errors.deadline ? "border-[#DC2626]" : "border-[#CBD5E1]"
                  }`}
                />
                {errors.deadline && (
                  <p className="mt-1 text-xs text-[#DC2626]">{errors.deadline}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#0F172A] mb-1.5">
                Description
              </label>
              <textarea
                value={form.description}
                onChange={(e) => handleChange("description", e.target.value)}
                rows={3}
                className="w-full px-3 py-2.5 text-sm border border-[#CBD5E1] rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition-all placeholder:text-[#94A3B8] resize-none"
                placeholder="Optional project description..."
              />
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
                {submitting ? "Creating..." : "Create Project"}
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

// --- Assign Editor Modal ---
interface AssignEditorModalProps extends ModalProps {
  projectId: string;
  currentEditorId: string | null;
  currentEditorName: string | null;
  editors: UserOption[];
  onSubmit: (projectId: string, editorId: string | null) => Promise<void>;
}

export function AssignEditorModal({
  isOpen,
  onClose,
  projectId,
  currentEditorId,
  currentEditorName,
  editors,
  onSubmit,
}: AssignEditorModalProps) {
  const [selectedEditorId, setSelectedEditorId] = useState<string>(currentEditorId || "");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      setSelectedEditorId(currentEditorId || "");
      setError("");
    }
  }, [isOpen, currentEditorId]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEditorId && !currentEditorId) {
      setError("Please select an editor");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const editorIdToSubmit = selectedEditorId === currentEditorId ? selectedEditorId : selectedEditorId;
      await onSubmit(projectId, editorIdToSubmit || null);
      onClose();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to assign editor";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleUnassign = async () => {
    setSubmitting(true);
    setError("");

    try {
      await onSubmit(projectId, null);
      onClose();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to unassign editor";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="flex flex-row items-center justify-between border-b border-[#E2E8F0] px-6 py-4">
          <CardTitle className="text-lg font-semibold text-[#0F172A]">Assign Editor</CardTitle>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#64748B] hover:bg-[#F1F5F9] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-[#FEF2F2] border border-[#FECACA] rounded-lg text-sm text-[#DC2626]">
                {error}
              </div>
            )}

            {currentEditorName && (
              <div className="p-3 bg-[#F0FDF4] border border-[#BBF7D0] rounded-lg text-sm text-[#166534]">
                Currently assigned to: <strong>{currentEditorName}</strong>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-[#0F172A] mb-1.5">
                Select Editor
              </label>
              <select
                value={selectedEditorId}
                onChange={(e) => setSelectedEditorId(e.target.value)}
                className="w-full px-3 py-2.5 text-sm border border-[#CBD5E1] rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition-all"
              >
                <option value="">-- Select an editor --</option>
                {editors.map((editor) => (
                  <option key={editor.id} value={editor.id}>
                    {editor.name} ({editor.email})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center justify-between pt-2">
              <div>
                {currentEditorId && (
                  <button
                    type="button"
                    onClick={handleUnassign}
                    disabled={submitting}
                    className="text-sm text-[#DC2626] hover:text-[#B91C1C] transition-colors disabled:opacity-50"
                  >
                    Remove assignment
                  </button>
                )}
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 text-sm font-medium text-[#64748B] border border-[#E2E8F0] rounded-lg hover:bg-[#F8FAFC] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || !selectedEditorId}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#1E3A8A] text-white text-sm font-semibold rounded-lg hover:bg-[#1D4ED8] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  {submitting ? "Assigning..." : "Assign"}
                </button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

// --- Edit Project Modal ---
interface EditProjectModalProps extends ModalProps {
  project: {
    id: string;
    name: string;
    location: string;
    budget: number;
    deadline: string;
    description: string | null;
    status: string;
  };
  onSubmit: (id: string, data: Partial<ProjectFormData & { status: string }>) => Promise<void>;
}

export function EditProjectModal({ isOpen, onClose, project, onSubmit }: EditProjectModalProps) {
  const [form, setForm] = useState({
    name: "",
    location: "",
    budget: "",
    deadline: "",
    description: "",
    status: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen && project) {
      setForm({
        name: project.name,
        location: project.location,
        budget: String(project.budget),
        deadline: project.deadline ? project.deadline.split("T")[0] : "",
        description: project.description || "",
        status: project.status,
      });
      setErrors({});
    }
  }, [isOpen, project]);

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
      await onSubmit(project.id, form);
      onClose();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to update project";
      setErrors({ form: message });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between border-b border-[#E2E8F0] px-6 py-4">
          <CardTitle className="text-lg font-semibold text-[#0F172A]">Edit Project</CardTitle>
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
              <label className="block text-sm font-medium text-[#0F172A] mb-1.5">Project Name</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => handleChange("name", e.target.value)}
                className={`w-full px-3 py-2.5 text-sm border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition-all ${
                  errors.name ? "border-[#DC2626]" : "border-[#CBD5E1]"
                }`}
              />
              {errors.name && <p className="mt-1 text-xs text-[#DC2626]">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-[#0F172A] mb-1.5">Location</label>
              <input
                type="text"
                value={form.location}
                onChange={(e) => handleChange("location", e.target.value)}
                className={`w-full px-3 py-2.5 text-sm border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition-all ${
                  errors.location ? "border-[#DC2626]" : "border-[#CBD5E1]"
                }`}
              />
              {errors.location && <p className="mt-1 text-xs text-[#DC2626]">{errors.location}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#0F172A] mb-1.5">Budget (RWF)</label>
                <input
                  type="number"
                  min="1"
                  value={form.budget}
                  onChange={(e) => handleChange("budget", e.target.value)}
                  className={`w-full px-3 py-2.5 text-sm border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition-all ${
                    errors.budget ? "border-[#DC2626]" : "border-[#CBD5E1]"
                  }`}
                />
                {errors.budget && <p className="mt-1 text-xs text-[#DC2626]">{errors.budget}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-[#0F172A] mb-1.5">Deadline</label>
                <input
                  type="date"
                  value={form.deadline}
                  onChange={(e) => handleChange("deadline", e.target.value)}
                  className={`w-full px-3 py-2.5 text-sm border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition-all ${
                    errors.deadline ? "border-[#DC2626]" : "border-[#CBD5E1]"
                  }`}
                />
                {errors.deadline && <p className="mt-1 text-xs text-[#DC2626]">{errors.deadline}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#0F172A] mb-1.5">Status</label>
              <select
                value={form.status}
                onChange={(e) => handleChange("status", e.target.value)}
                className="w-full px-3 py-2.5 text-sm border border-[#CBD5E1] rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition-all"
              >
                <option value="PENDING">Pending</option>
                <option value="ACTIVE">Active</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#0F172A] mb-1.5">Description</label>
              <textarea
                value={form.description}
                onChange={(e) => handleChange("description", e.target.value)}
                rows={3}
                className="w-full px-3 py-2.5 text-sm border border-[#CBD5E1] rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition-all resize-none"
              />
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
                {submitting ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

