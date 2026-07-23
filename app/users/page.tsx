"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/lib/context/AuthContext";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Users,
  Shield,
  Plus,
  Search,
  Pencil,
  Trash2,
  X,
  Mail,
  UserCircle,
  Calendar,
  AlertCircle,
  Loader2,
  CheckCircle2,
} from "lucide-react";

interface User {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "EDITOR" | "VIEWER";
  createdAt: string;
}

type ModalMode = "create" | "edit" | null;

const ROLE_VARIANTS: Record<string, "default" | "secondary" | "destructive"> = {
  ADMIN: "destructive",
  EDITOR: "default",
  VIEWER: "secondary",
};

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function UsersPage() {
  const { user: currentUser } = useAuth();

  // State
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("");

  // Modal state
  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "" as "" | "ADMIN" | "EDITOR" | "VIEWER",
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [formSuccess, setFormSuccess] = useState("");

  // Fetch users
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      const params = new URLSearchParams();
      if (roleFilter) params.set("role", roleFilter);
      if (search) params.set("search", search);

      const res = await fetch(`/api/users?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      if (res.ok) {
        setUsers(data.data.users);
      } else {
        setError(data.message || "Failed to load users");
      }
    } catch {
      setError("Failed to load users. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [roleFilter, search]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers();
    }, 300);
    return () => clearTimeout(timer);
  }, [search, fetchUsers]);

  // Open create modal
  const openCreateModal = () => {
    setFormData({ name: "", email: "", password: "", role: "" });
    setFormErrors({});
    setFormSuccess("");
    setEditingUser(null);
    setModalMode("create");
  };

  // Open edit modal
  const openEditModal = (user: User) => {
    setFormData({
      name: user.name,
      email: user.email,
      password: "",
      role: user.role,
    });
    setFormErrors({});
    setFormSuccess("");
    setEditingUser(user);
    setModalMode("edit");
  };

  // Close modal
  const closeModal = () => {
    setModalMode(null);
    setEditingUser(null);
    setFormErrors({});
    setFormSuccess("");
  };

  // Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setFormErrors({});
    setFormSuccess("");

    try {
      const token = localStorage.getItem("token");

      if (modalMode === "create") {
        const res = await fetch("/api/users", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(formData),
        });
        const data = await res.json();

        if (res.ok) {
          setFormSuccess("User created successfully!");
          fetchUsers();
          setTimeout(closeModal, 1000);
        } else {
          setFormErrors(data.errors || { _general: data.message });
        }
      } else if (modalMode === "edit" && editingUser) {
        const body: Record<string, unknown> = {
          name: formData.name,
          email: formData.email,
          role: formData.role,
        };
        if (formData.password) {
          body.password = formData.password;
        }

        const res = await fetch(`/api/users/${editingUser.id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(body),
        });
        const data = await res.json();

        if (res.ok) {
          setFormSuccess("User updated successfully!");
          fetchUsers();
          setTimeout(closeModal, 1000);
        } else {
          setFormErrors(data.errors || { _general: data.message });
        }
      }
    } catch {
      setFormErrors({ _general: "An unexpected error occurred" });
    } finally {
      setSubmitting(false);
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (!deleteTarget) return;
    setSubmitting(true);

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/users/${deleteTarget.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      if (res.ok) {
        fetchUsers();
        setDeleteTarget(null);
      } else {
        setError(data.message || "Failed to delete user");
      }
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  // Role badge helper
  const getRoleBadge = (role: string) => {
    const variant = ROLE_VARIANTS[role] || "secondary";
    const label = role.charAt(0) + role.slice(1).toLowerCase();
    return <Badge variant={variant}>{label}</Badge>;
  };

  // Only Admin can access
  if (currentUser?.role !== "ADMIN") {
    return (
      <DashboardLayout>
        <Card>
          <CardContent className="py-16 text-center">
            <Shield className="w-12 h-12 text-[#DC2626] mx-auto mb-4" />
            <h2 className="text-xl font-bold text-[#0F172A] mb-2">Access Denied</h2>
            <p className="text-sm text-[#64748B]">You do not have permission to view this page.</p>
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A]">User Management</h1>
          <p className="text-[#64748B] mt-1">Manage system users and their roles</p>
        </div>
        <Button onClick={openCreateModal}>
          <Plus className="w-4 h-4 mr-2" />
          Add User
        </Button>
      </div>

      {/* Error banner */}
      {error && (
        <div className="flex items-center gap-2 p-3 mb-6 bg-red-50 border border-red-200 rounded-lg text-sm text-[#DC2626]">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
          <button onClick={() => setError("")} className="ml-auto">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name or email..."
                className="w-full pl-9 pr-4 py-2 text-sm border border-[#CBD5E1] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent"
              />
            </div>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-3 py-2 text-sm border border-[#CBD5E1] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent bg-white"
            >
              <option value="">All Roles</option>
              <option value="ADMIN">Admin</option>
              <option value="EDITOR">Editor</option>
              <option value="VIEWER">Viewer</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-6 h-6 text-[#2563EB] animate-spin" />
              <span className="ml-3 text-sm text-[#64748B]">Loading users...</span>
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-16">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-[#F1F5F9] rounded-2xl mb-4">
                <Users className="w-8 h-8 text-[#64748B]" />
              </div>
              <h3 className="text-lg font-semibold text-[#0F172A] mb-2">
                {search || roleFilter ? "No users found" : "No users yet"}
              </h3>
              <p className="text-sm text-[#64748B] max-w-sm mx-auto mb-4">
                {search || roleFilter
                  ? "Try adjusting your search or filter criteria."
                  : "Get started by adding your first user."}
              </p>
              {!search && !roleFilter && (
                <Button onClick={openCreateModal} variant="outline">
                  <Plus className="w-4 h-4 mr-2" />
                  Add User
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#E2E8F0]">
                    <th className="text-left text-xs font-semibold text-[#64748B] uppercase tracking-wider px-6 py-4">User</th>
                    <th className="text-left text-xs font-semibold text-[#64748B] uppercase tracking-wider px-6 py-4">Email</th>
                    <th className="text-left text-xs font-semibold text-[#64748B] uppercase tracking-wider px-6 py-4">Role</th>
                    <th className="text-left text-xs font-semibold text-[#64748B] uppercase tracking-wider px-6 py-4">Created</th>
                    <th className="text-right text-xs font-semibold text-[#64748B] uppercase tracking-wider px-6 py-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0]">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-[#F8FAFC] transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-[#1E3A8A] rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0">
                            {u.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-[#0F172A]">{u.name}</p>
                            {u.id === currentUser?.id && (
                              <span className="text-xs text-[#64748B]">(You)</span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5 text-[#64748B]" />
                          <span className="text-sm text-[#475569]">{u.email}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">{getRoleBadge(u.role)}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-[#64748B]" />
                          <span className="text-sm text-[#475569]">{formatDate(u.createdAt)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => openEditModal(u)}
                            className="p-2 rounded-lg text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#2563EB] transition-colors"
                            title="Edit user"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          {u.id !== currentUser?.id && (
                            <button
                              onClick={() => setDeleteTarget(u)}
                              className="p-2 rounded-lg text-[#64748B] hover:bg-[#FEF2F2] hover:text-[#DC2626] transition-colors"
                              title="Delete user"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Modal */}
      {modalMode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/30" onClick={closeModal} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            {/* Modal header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-bold text-[#0F172A]">
                  {modalMode === "create" ? "Add New User" : "Edit User"}
                </h2>
                <p className="text-sm text-[#64748B] mt-0.5">
                  {modalMode === "create"
                    ? "Create a new user account"
                    : `Editing ${editingUser?.name}`}
                </p>
              </div>
              <button
                onClick={closeModal}
                className="p-2 rounded-lg text-[#64748B] hover:bg-[#F1F5F9] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Success message */}
            {formSuccess && (
              <div className="flex items-center gap-2 p-3 mb-4 bg-green-50 border border-green-200 rounded-lg text-sm text-[#16A34A]">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{formSuccess}</span>
              </div>
            )}

            {/* Form errors */}
            {formErrors._general && (
              <div className="flex items-center gap-2 p-3 mb-4 bg-red-50 border border-red-200 rounded-lg text-sm text-[#DC2626]">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formErrors._general}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-[#0F172A] mb-1.5">Full Name</label>
                <div className="relative">
                  <UserCircle className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="John Doe"
                    className={`w-full pl-9 pr-4 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent ${
                      formErrors.name ? "border-[#DC2626]" : "border-[#CBD5E1]"
                    }`}
                  />
                </div>
                {formErrors.name && (
                  <p className="text-xs text-[#DC2626] mt-1">{formErrors.name}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-[#0F172A] mb-1.5">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="user@example.com"
                    className={`w-full pl-9 pr-4 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent ${
                      formErrors.email ? "border-[#DC2626]" : "border-[#CBD5E1]"
                    }`}
                  />
                </div>
                {formErrors.email && (
                  <p className="text-xs text-[#DC2626] mt-1">{formErrors.email}</p>
                )}
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-[#0F172A] mb-1.5">
                  {modalMode === "create" ? "Password" : "New Password (leave blank to keep current)"}
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder={modalMode === "create" ? "At least 6 characters" : "Leave blank to keep current"}
                  className={`w-full px-4 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent ${
                    formErrors.password ? "border-[#DC2626]" : "border-[#CBD5E1]"
                  }`}
                />
                {formErrors.password && (
                  <p className="text-xs text-[#DC2626] mt-1">{formErrors.password}</p>
                )}
              </div>

              {/* Role */}
              <div>
                <label className="block text-sm font-medium text-[#0F172A] mb-1.5">Role</label>
                <div className="grid grid-cols-3 gap-2">
                  {(["ADMIN", "EDITOR", "VIEWER"] as const).map((role) => (
                    <button
                      key={role}
                      type="button"
                      onClick={() => setFormData({ ...formData, role })}
                      className={`flex flex-col items-center gap-1 p-3 border rounded-xl text-xs transition-all duration-200 ${
                        formData.role === role
                          ? role === "ADMIN"
                            ? "border-[#DC2626] bg-red-50 text-[#DC2626]"
                            : "border-[#1E3A8A] bg-[#DBEAFE] text-[#1E3A8A]"
                          : "border-[#E2E8F0] text-[#64748B] hover:border-[#CBD5E1] hover:bg-[#F8FAFC]"
                      }`}
                    >
                      <Shield className="w-4 h-4" />
                      <span className="font-medium">{role.charAt(0) + role.slice(1).toLowerCase()}</span>
                    </button>
                  ))}
                </div>
                {formErrors.role && (
                  <p className="text-xs text-[#DC2626] mt-1">{formErrors.role}</p>
                )}
              </div>

              {/* Submit */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 py-2.5 px-4 border border-[#CBD5E1] text-sm font-medium text-[#64748B] rounded-lg hover:bg-[#F8FAFC] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2.5 px-4 bg-[#1E3A8A] hover:bg-[#1D4ED8] text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>{modalMode === "create" ? "Creating..." : "Saving..."}</span>
                    </>
                  ) : (
                    modalMode === "create" ? "Create User" : "Save Changes"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/30" onClick={() => setDeleteTarget(null)} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-14 h-14 bg-red-50 rounded-2xl mb-4">
                <Trash2 className="w-7 h-7 text-[#DC2626]" />
              </div>
              <h2 className="text-lg font-bold text-[#0F172A] mb-2">Delete User</h2>
              <p className="text-sm text-[#64748B] mb-1">
                Are you sure you want to delete
              </p>
              <p className="text-sm font-semibold text-[#0F172A]">
                {deleteTarget.name}
              </p>
              <p className="text-xs text-[#94A3B8] mt-2">
                This action cannot be undone. The user will permanently lose access.
              </p>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setDeleteTarget(null)}
                className="flex-1 py-2.5 px-4 border border-[#CBD5E1] text-sm font-medium text-[#64748B] rounded-lg hover:bg-[#F8FAFC] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={submitting}
                className="flex-1 py-2.5 px-4 bg-[#DC2626] hover:bg-[#B91C1C] text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  "Delete User"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

