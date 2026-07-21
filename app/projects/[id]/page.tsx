"use client";

import { useAuth } from "@/lib/context/AuthContext";
import DashboardLayout from "@/components/DashboardLayout";
import StatsCard from "@/components/StatsCard";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import {
  FolderKanban,
  Users,
  DollarSign,
  Clock,
  Calendar,
  MapPin,
  User,
  ArrowLeft,
  Loader2,
  Pencil,
  UserPlus,
  Trash2,
} from "lucide-react";
import {
  AssignEditorModal,
  EditProjectModal,
  type ProjectFormData,
  type UserOption,
} from "@/components/ProjectModals";

interface Project {
  id: string;
  name: string;
  location: string;
  budget: number;
  deadline: string;
  description: string | null;
  status: "PENDING" | "ACTIVE" | "COMPLETED" | "CANCELLED";
  createdAt: string;
  updatedAt: string;
  createdBy: { id: string; name: string; email: string };
  assignedEditor: { id: string; name: string; email: string } | null;
}

const statusConfig: Record<
  string,
  { label: string; variant: "info" | "warning" | "success" | "danger" }
> = {
  ACTIVE: { label: "Active", variant: "info" },
  PENDING: { label: "Pending", variant: "warning" },
  COMPLETED: { label: "Completed", variant: "success" },
  CANCELLED: { label: "Cancelled", variant: "danger" },
};

function formatCurrency(amount: number) {
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
    month: "long",
    day: "numeric",
  });
}

function getDaysRemaining(deadline: string): number {
  const now = new Date();
  const deadlineDate = new Date(deadline);
  const diff = deadlineDate.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

export default function ProjectDetailPage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const role = user?.role || "VIEWER";
  const projectId = params.id as string;

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editors, setEditors] = useState<UserOption[]>([]);

  const fetchProject = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/projects/${projectId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setProject(data.data.project);
      } else {
        setError(data.message || "Project not found");
      }
    } catch {
      setError("Failed to load project");
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchProject();
  }, [fetchProject]);

  const fetchEditors = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/users?role=EDITOR", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setEditors(data.data.users || []);
      }
    } catch {
      // Silent fail
    }
  }, []);

  const handleOpenAssign = async () => {
    await fetchEditors();
    setShowAssignModal(true);
  };

  // --- Edit project ---
  const handleEditProject = async (id: string, data: Partial<ProjectFormData & { status: string }>) => {
    const token = localStorage.getItem("token");
    const res = await fetch(`/api/projects/${id}`, {
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
    await fetchProject();
  };

  // --- Assign editor ---
  const handleAssignEditor = async (projId: string, editorId: string | null) => {
    const token = localStorage.getItem("token");

    if (editorId) {
      const res = await fetch(`/api/projects/${projId}/assign`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ editorId }),
      });
      const result = await res.json();
      if (!result.success) throw new Error(result.message);
    } else {
      const res = await fetch(`/api/projects/${projId}/assign`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await res.json();
      if (!result.success) throw new Error(result.message);
    }

    await fetchProject();
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

  if (error || !project) {
    return (
      <DashboardLayout>
        <div className="text-center py-24">
          <p className="text-[#DC2626] text-lg font-medium mb-4">{error || "Project not found"}</p>
          <button
            onClick={() => router.push("/projects")}
            className="inline-flex items-center gap-2 text-sm text-[#1E3A8A] hover:text-[#1D4ED8] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Projects
          </button>
        </div>
      </DashboardLayout>
    );
  }

  const config = statusConfig[project.status];
  const editorName = project.assignedEditor?.name || "Unassigned";
  const daysRemaining = getDaysRemaining(project.deadline);
  const isOverdue = new Date(project.deadline) < new Date() && project.status !== "COMPLETED" && project.status !== "CANCELLED";

  return (
    <DashboardLayout>
      {/* Back button */}
      <button
        onClick={() => router.push("/projects")}
        className="inline-flex items-center gap-2 text-sm text-[#64748B] hover:text-[#1E3A8A] transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Projects
      </button>

      {/* Project Header */}
      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6 mb-8">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-bold text-[#0F172A]">{project.name}</h1>
            <Badge variant={config.variant} className="text-sm px-3 py-1">
              {config.label}
            </Badge>
          </div>
          <div className="flex items-center gap-2 text-[#64748B]">
            <MapPin className="w-4 h-4" />
            <span>{project.location}</span>
          </div>
          {project.description && (
            <p className="mt-3 text-sm text-[#64748B] max-w-2xl">{project.description}</p>
          )}
        </div>

        {/* Admin actions */}
        {role === "ADMIN" && (
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setShowEditModal(true)}
              className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-[#64748B] border border-[#E2E8F0] rounded-lg hover:bg-[#F8FAFC] transition-colors"
            >
              <Pencil className="w-4 h-4" />
              Edit
            </button>
            <button
              onClick={handleOpenAssign}
              className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-[#64748B] border border-[#E2E8F0] rounded-lg hover:bg-[#F8FAFC] transition-colors"
            >
              <UserPlus className="w-4 h-4" />
              Assign Editor
            </button>
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
        <StatsCard
          title="Budget"
          value={formatCurrency(project.budget)}
          icon={<DollarSign className="w-full h-full" />}
          iconBg="bg-[#DCFCE7]"
          iconColor="text-[#16A34A]"
        />
        <StatsCard
          title="Deadline"
          value={formatDate(project.deadline)}
          icon={<Calendar className="w-full h-full" />}
          iconBg="bg-[#DBEAFE]"
          iconColor="text-[#1E3A8A]"
          description={
            isOverdue
              ? "Overdue"
              : `${daysRemaining} days remaining`
          }
        />
        <StatsCard
          title="Created By"
          value={project.createdBy.name}
          icon={<User className="w-full h-full" />}
          iconBg="bg-[#CCFBF1]"
          iconColor="text-[#0F766E]"
        />
        <StatsCard
          title="Assigned Editor"
          value={editorName}
          icon={<Users className="w-full h-full" />}
          iconBg="bg-[#FEF9C3]"
          iconColor="text-[#EAB308]"
        />
      </div>

      {/* Project Info Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold text-[#0F172A]">
            Project Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <p className="text-xs font-medium text-[#64748B] uppercase tracking-wider">
                  Project Name
                </p>
                <p className="mt-1 text-sm text-[#0F172A]">{project.name}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-[#64748B] uppercase tracking-wider">
                  Location
                </p>
                <p className="mt-1 text-sm text-[#0F172A]">{project.location}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-[#64748B] uppercase tracking-wider">
                  Status
                </p>
                <div className="mt-1">
                  <Badge variant={config.variant}>{config.label}</Badge>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-xs font-medium text-[#64748B] uppercase tracking-wider">
                  Budget
                </p>
                <p className="mt-1 text-sm text-[#0F172A] font-semibold">
                  {formatCurrency(project.budget)}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-[#64748B] uppercase tracking-wider">
                  Deadline
                </p>
                <p className="mt-1 text-sm text-[#0F172A]">
                  {formatDate(project.deadline)}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-[#64748B] uppercase tracking-wider">
                  Description
                </p>
                <p className="mt-1 text-sm text-[#64748B]">
                  {project.description || "No description provided"}
                </p>
              </div>
            </div>
          </div>

          <hr className="my-6 border-[#E2E8F0]" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-xs font-medium text-[#64748B] uppercase tracking-wider">
                Created By
              </p>
              <p className="mt-1 text-sm text-[#0F172A]">
                {project.createdBy.name}
              </p>
              <p className="text-xs text-[#64748B]">{project.createdBy.email}</p>
              <p className="text-xs text-[#64748B] mt-1">
                {formatDate(project.createdAt)}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-[#64748B] uppercase tracking-wider">
                Assigned Editor
              </p>
              {project.assignedEditor ? (
                <>
                  <p className="mt-1 text-sm text-[#0F172A]">
                    {project.assignedEditor.name}
                  </p>
                  <p className="text-xs text-[#64748B]">
                    {project.assignedEditor.email}
                  </p>
                </>
              ) : (
                <p className="mt-1 text-sm text-[#94A3B8] italic">
                  No editor assigned yet
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Modals */}
      {project && (
        <>
          <AssignEditorModal
            isOpen={showAssignModal}
            onClose={() => setShowAssignModal(false)}
            projectId={project.id}
            currentEditorId={project.assignedEditor?.id || null}
            currentEditorName={project.assignedEditor?.name || null}
            editors={editors}
            onSubmit={handleAssignEditor}
          />
          <EditProjectModal
            isOpen={showEditModal}
            onClose={() => setShowEditModal(false)}
            project={project}
            onSubmit={handleEditProject}
          />
        </>
      )}
    </DashboardLayout>
  );
}

