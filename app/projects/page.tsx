"use client";

import { useAuth } from "@/lib/context/AuthContext";
import DashboardLayout from "@/components/DashboardLayout";
import StatsCard from "@/components/StatsCard";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import {
  FolderKanban,
  Users,
  DollarSign,
  Clock,
  Plus,
  Search,
  Filter,
  Loader2,
  MoreHorizontal,
  Pencil,
  UserPlus,
  Trash2,
} from "lucide-react";
import {
  CreateProjectModal,
  AssignEditorModal,
  EditProjectModal,
  type ProjectFormData,
  type UserOption,
} from "@/components/ProjectModals";

// --- Types ---
interface Project {
  id: string;
  name: string;
  location: string;
  budget: number;
  deadline: string;
  description: string | null;
  status: "PENDING" | "ACTIVE" | "COMPLETED" | "CANCELLED";
  createdAt: string;
  createdBy: { id: string; name: string; email: string };
  assignedEditor: { id: string; name: string; email: string } | null;
  // Frontend-computed fields (from API or computed)
  papsCount?: number;
  paidCount?: number;
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
    month: "short",
    day: "numeric",
  });
}

export default function ProjectsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const role = user?.role || "VIEWER";

  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [editors, setEditors] = useState<UserOption[]>([]);
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);

  // --- Fetch projects ---
  const fetchProjects = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const params = new URLSearchParams();
      if (searchQuery) params.set("search", searchQuery);

      const res = await fetch(`/api/projects?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setProjects(data.data.projects);
      }
    } catch {
      // Silent fail
    } finally {
      setLoading(false);
    }
  }, [searchQuery]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  // --- Fetch editors (for assign modal) ---
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

  const handleOpenAssign = async (project: Project) => {
    setSelectedProject(project);
    await fetchEditors();
    setShowAssignModal(true);
    setDropdownOpen(null);
  };

  const handleOpenEdit = (project: Project) => {
    setSelectedProject(project);
    setShowEditModal(true);
    setDropdownOpen(null);
  };

  // --- Create project ---
  const handleCreateProject = async (data: ProjectFormData) => {
    const token = localStorage.getItem("token");
    const res = await fetch("/api/projects", {
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
    await fetchProjects();
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
    await fetchProjects();
  };

  // --- Assign editor ---
  const handleAssignEditor = async (projectId: string, editorId: string | null) => {
    const token = localStorage.getItem("token");

    if (editorId) {
      const res = await fetch(`/api/projects/${projectId}/assign`, {
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
      const res = await fetch(`/api/projects/${projectId}/assign`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await res.json();
      if (!result.success) throw new Error(result.message);
    }

    await fetchProjects();
  };

  // --- Delete project ---
  const handleDeleteProject = async (projectId: string) => {
    if (!confirm("Are you sure you want to delete this project? This action cannot be undone.")) {
      return;
    }
    const token = localStorage.getItem("token");
    const res = await fetch(`/api/projects/${projectId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    const result = await res.json();
    if (!result.success) {
      alert(result.message);
      return;
    }
    await fetchProjects();
    setDropdownOpen(null);
  };

  // --- Computed stats ---
  const totalBudget = projects.reduce((sum, p) => sum + p.budget, 0);
  const totalActive = projects.filter((p) => p.status === "ACTIVE").length;

  return (
    <DashboardLayout>
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A]">Projects</h1>
          <p className="text-[#64748B] mt-1">
            Manage and view all expropriation projects
          </p>
        </div>
        {role === "ADMIN" && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#1E3A8A] text-white text-sm font-semibold rounded-lg hover:bg-[#1D4ED8] transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Project
          </button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
        <StatsCard
          title="Total Projects"
          value={projects.length}
          icon={<FolderKanban className="w-full h-full" />}
          iconBg="bg-[#DBEAFE]"
          iconColor="text-[#1E3A8A]"
        />
        <StatsCard
          title="Active Projects"
          value={totalActive}
          icon={<Users className="w-full h-full" />}
          iconBg="bg-[#CCFBF1]"
          iconColor="text-[#0F766E]"
        />
        <StatsCard
          title="Total Budget"
          value={formatCurrency(totalBudget)}
          icon={<DollarSign className="w-full h-full" />}
          iconBg="bg-[#DCFCE7]"
          iconColor="text-[#16A34A]"
        />
        <StatsCard
          title="Completed"
          value={projects.filter((p) => p.status === "COMPLETED").length}
          icon={<Clock className="w-full h-full" />}
          iconBg="bg-[#FEF9C3]"
          iconColor="text-[#EAB308]"
        />
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
          <input
            type="text"
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-sm border border-[#CBD5E1] rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition-all placeholder:text-[#94A3B8]"
          />
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-[#64748B] border border-[#E2E8F0] rounded-lg hover:bg-[#F8FAFC] transition-colors">
          <Filter className="w-4 h-4" />
          Filters
        </button>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 text-[#1E3A8A] animate-spin" />
        </div>
      ) : projects.length > 0 ? (
        /* Projects List */
        <div className="space-y-4">
          {projects.map((project) => {
            const config = statusConfig[project.status];
            const editorName = project.assignedEditor?.name || "Unassigned";
            const progressPercent = project.papsCount && project.papsCount > 0
              ? Math.round(((project.paidCount || 0) / project.papsCount) * 100)
              : 0;

            return (
              <Card key={project.id} className="relative hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    {/* Left: Project Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <button
                          onClick={() => router.push(`/projects/${project.id}`)}
                          className="text-base font-semibold text-[#0F172A] hover:text-[#1E3A8A] transition-colors text-left"
                        >
                          {project.name}
                        </button>
                        <Badge variant={config.variant}>{config.label}</Badge>
                      </div>
                      <p className="text-sm text-[#64748B] mb-3">
                        {project.location}
                      </p>
                      <div className="flex flex-wrap items-center gap-4 text-xs text-[#64748B]">
                        <span className="flex items-center gap-1">
                          <DollarSign className="w-3.5 h-3.5" />
                          {formatCurrency(project.budget)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          Deadline: {formatDate(project.deadline)}
                        </span>
                        <span className="text-[#94A3B8]">
                          Editor: {editorName}
                        </span>
                        <span className="text-[#94A3B8]">
                          Created by: {project.createdBy.name}
                        </span>
                      </div>
                    </div>

                    {/* Right: Actions & Progress */}
                    <div className="lg:text-right min-w-[180px]">
                      {/* Actions dropdown (Admin only) */}
                      {role === "ADMIN" && (
                        <div className="relative flex justify-end mb-2">
                          <button
                            onClick={() =>
                              setDropdownOpen(
                                dropdownOpen === project.id ? null : project.id
                              )
                            }
                            className="p-1 rounded-lg text-[#64748B] hover:bg-[#F1F5F9] transition-colors"
                          >
                            <MoreHorizontal className="w-4 h-4" />
                          </button>
                          {dropdownOpen === project.id && (
                            <div className="absolute right-0 top-8 z-20 w-48 bg-white border border-[#E2E8F0] rounded-lg shadow-lg py-1">
                              <button
                                onClick={() => handleOpenEdit(project)}
                                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-[#0F172A] hover:bg-[#F8FAFC] transition-colors"
                              >
                                <Pencil className="w-4 h-4" />
                                Edit project
                              </button>
                              <button
                                onClick={() => handleOpenAssign(project)}
                                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-[#0F172A] hover:bg-[#F8FAFC] transition-colors"
                              >
                                <UserPlus className="w-4 h-4" />
                                Assign editor
                              </button>
                              <hr className="my-1 border-[#E2E8F0]" />
                              <button
                                onClick={() => handleDeleteProject(project.id)}
                                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-[#DC2626] hover:bg-[#FEF2F2] transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                                Delete project
                              </button>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Click to view details */}
                      <button
                        onClick={() => router.push(`/projects/${project.id}`)}
                        className="mt-2 inline-flex items-center gap-1 text-xs text-[#64748B] hover:text-[#1E3A8A] transition-colors"
                      >
                        <MoreHorizontal className="w-3.5 h-3.5" />
                        View details
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        /* Empty State */
        <Card>
          <CardContent className="py-16 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-[#F1F5F9] rounded-2xl mb-4">
              <FolderKanban className="w-8 h-8 text-[#64748B]" />
            </div>
            <h3 className="text-lg font-semibold text-[#0F172A] mb-2">
              No projects yet
            </h3>
            <p className="text-sm text-[#64748B] max-w-sm mx-auto">
              {role === "ADMIN"
                ? "Create your first project to get started."
                : "Projects will appear here once they are created by an administrator."}
            </p>
            {role === "ADMIN" && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-[#1E3A8A] text-white text-sm font-semibold rounded-lg hover:bg-[#1D4ED8] transition-colors"
              >
                <Plus className="w-4 h-4" />
                Create Project
              </button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Modals */}
      <CreateProjectModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateProject}
      />

      {selectedProject && (
        <>
          <AssignEditorModal
            isOpen={showAssignModal}
            onClose={() => {
              setShowAssignModal(false);
              setSelectedProject(null);
            }}
            projectId={selectedProject.id}
            currentEditorId={selectedProject.assignedEditor?.id || null}
            currentEditorName={selectedProject.assignedEditor?.name || null}
            editors={editors}
            onSubmit={handleAssignEditor}
          />
          <EditProjectModal
            isOpen={showEditModal}
            onClose={() => {
              setShowEditModal(false);
              setSelectedProject(null);
            }}
            project={selectedProject}
            onSubmit={handleEditProject}
          />
        </>
      )}
    </DashboardLayout>
  );
}

