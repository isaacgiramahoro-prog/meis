"use client";

import { useAuth } from "@/lib/context/AuthContext";

export default function DashboardPage() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Header */}
      <header className="bg-[#1E3A8A] text-white">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-white/20 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-semibold">MEIS</h1>
              <p className="text-xs text-blue-200">Management System</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium">{user?.name}</p>
              <p className="text-xs text-blue-200 capitalize">{user?.role?.toLowerCase()}</p>
            </div>
            <button
              onClick={logout}
              className="px-3 py-1.5 text-sm bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Welcome */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-[#0F172A]">
            Welcome, {user?.name}
          </h2>
          <p className="text-[#64748B] mt-1">
            You are logged in as an <strong className="text-[#1E3A8A] capitalize">{user?.role?.toLowerCase()}</strong>
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-[0_4px_8px_rgba(15,23,42,0.08)] p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-[#DBEAFE] rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-[#1E3A8A]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div>
                <p className="text-3xl font-bold text-[#0F172A]">0</p>
                <p className="text-sm text-[#64748B]">Total Projects</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-[0_4px_8px_rgba(15,23,42,0.08)] p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-[#CCFBF1] rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-[#0F766E]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
              </div>
              <div>
                <p className="text-3xl font-bold text-[#0F172A]">0</p>
                <p className="text-sm text-[#64748B]">Active PAPs</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-[0_4px_8px_rgba(15,23,42,0.08)] p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-[#FEF9C3] rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-[#EAB308]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-3xl font-bold text-[#0F172A]">0</p>
                <p className="text-sm text-[#64748B]">Pending Reviews</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-[0_4px_8px_rgba(15,23,42,0.08)] p-6">
          <h3 className="text-lg font-semibold text-[#0F172A] mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="flex items-center gap-3 p-3 border border-[#E2E8F0] rounded-lg hover:bg-[#F8FAFC] hover:border-[#CBD5E1] transition-all text-left">
              <div className="w-9 h-9 bg-[#DBEAFE] rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-[#1E3A8A]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-[#0F172A]">New Project</p>
                <p className="text-xs text-[#64748B]">Create a new expropriation project</p>
              </div>
            </button>
            <button className="flex items-center gap-3 p-3 border border-[#E2E8F0] rounded-lg hover:bg-[#F8FAFC] hover:border-[#CBD5E1] transition-all text-left">
              <div className="w-9 h-9 bg-[#CCFBF1] rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-[#0F766E]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-[#0F172A]">Register PAP</p>
                <p className="text-xs text-[#64748B]">Register a Project Affected Person</p>
              </div>
            </button>
            <button className="flex items-center gap-3 p-3 border border-[#E2E8F0] rounded-lg hover:bg-[#F8FAFC] hover:border-[#CBD5E1] transition-all text-left">
              <div className="w-9 h-9 bg-[#FFEDD5] rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-[#F97316]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m0 0v-.375c0-.621-.504-1.125-1.125-1.125H3.75" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-[#0F172A]">View Reports</p>
                <p className="text-xs text-[#64748B]">Access project reports and analytics</p>
              </div>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

