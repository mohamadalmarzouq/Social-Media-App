'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { CardVibrant, CardSuccess, Card } from '@/components/ui/card';
import { CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface PlatformStats {
  totalUsers: number;
  totalContests: number;
  totalSubmissions: number;
  activeContests: number;
  completedContests: number;
  businessUsers: number;
  designerUsers: number;
  completionRate: number;
  averageSubmissionsPerContest: number;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: 'USER' | 'DESIGNER';
  createdAt: string;
  _count: {
    contests: number;
    submissions: number;
  };
}

interface Contest {
  id: string;
  title: string;
  platform: 'INSTAGRAM' | 'TIKTOK';
  status: 'DRAFT' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  _count: {
    submissions: number;
  };
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [contests, setContests] = useState<Contest[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'contests'>('overview');
  const router = useRouter();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, usersRes, contestsRes] = await Promise.all([
        fetch('/api/admin/stats'),
        fetch('/api/admin/users'),
        fetch('/api/admin/contests')
      ]);

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData.stats);
      }

      if (usersRes.ok) {
        const usersData = await usersRes.json();
        setUsers(usersData.users);
      }

      if (contestsRes.ok) {
        const contestsData = await contestsRes.json();
        setContests(contestsData.contests);
      }
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/auth', { method: 'DELETE' });
      router.push('/admin/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="text-center">
          <div className="spinner-vibrant h-8 w-8 mx-auto"></div>
          <p className="mt-2 text-neutral-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header with glass morphism */}
      <div className="bg-gradient-to-r from-white/90 via-white/80 to-white/70 backdrop-blur-md border-b border-white/20 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold gradient-text-accent">Admin Dashboard</h1>
              <p className="text-lg text-neutral-600 mt-1">Platform Management & Analytics</p>
            </div>
            <div className="flex gap-3">
              <Button 
                variant="glass" 
                size="lg"
                onClick={handleLogout}
              >
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <div className="flex space-x-1 bg-white/50 backdrop-blur-sm rounded-2xl p-1 mb-8 shadow-lg">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex-1 py-3 px-6 rounded-xl font-medium transition-all duration-200 ${
              activeTab === 'overview'
                ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg'
                : 'text-neutral-600 hover:text-neutral-900 hover:bg-white/50'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`flex-1 py-3 px-6 rounded-xl font-medium transition-all duration-200 ${
              activeTab === 'users'
                ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg'
                : 'text-neutral-600 hover:text-neutral-900 hover:bg-white/50'
            }`}
          >
            Users
          </button>
          <button
            onClick={() => setActiveTab('contests')}
            className={`flex-1 py-3 px-6 rounded-xl font-medium transition-all duration-200 ${
              activeTab === 'contests'
                ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg'
                : 'text-neutral-600 hover:text-neutral-900 hover:bg-white/50'
            }`}
          >
            Contests
          </button>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && stats && (
          <div className="space-y-8">
            {/* Platform Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="stat-card">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-neutral-800 mb-2">Total Users</h3>
                  <div className="stat-number">{stats.totalUsers}</div>
                </div>
              </div>

              <div className="stat-card">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-neutral-800 mb-2">Total Contests</h3>
                  <div className="stat-number">{stats.totalContests}</div>
                </div>
              </div>

              <div className="stat-card">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-neutral-800 mb-2">Total Submissions</h3>
                  <div className="stat-number">{stats.totalSubmissions}</div>
                </div>
              </div>

              <div className="stat-card">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-accent-400 to-accent-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-neutral-800 mb-2">Completion Rate</h3>
                  <div className="stat-number">{stats.completionRate}%</div>
                </div>
              </div>
            </div>

            {/* Detailed Stats */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <CardVibrant>
                <CardHeader>
                  <CardTitle>User Distribution</CardTitle>
                  <CardDescription>Breakdown of platform users by role</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-4 bg-white/50 rounded-2xl">
                      <span className="font-medium text-neutral-700">Business Owners</span>
                      <span className="text-2xl font-bold text-primary-600">{stats.businessUsers}</span>
                    </div>
                    <div className="flex justify-between items-center p-4 bg-white/50 rounded-2xl">
                      <span className="font-medium text-neutral-700">Designers</span>
                      <span className="text-2xl font-bold text-accent-600">{stats.designerUsers}</span>
                    </div>
                  </div>
                </CardContent>
              </CardVibrant>

              <CardSuccess>
                <CardHeader>
                  <CardTitle>Contest Performance</CardTitle>
                  <CardDescription>Current contest statistics</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-4 bg-white/50 rounded-2xl">
                      <span className="font-medium text-neutral-700">Active Contests</span>
                      <span className="text-2xl font-bold text-green-600">{stats.activeContests}</span>
                    </div>
                    <div className="flex justify-between items-center p-4 bg-white/50 rounded-2xl">
                      <span className="font-medium text-neutral-700">Avg Submissions/Contest</span>
                      <span className="text-2xl font-bold text-emerald-600">{stats.averageSubmissionsPerContest}</span>
                    </div>
                  </div>
                </CardContent>
              </CardSuccess>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <CardVibrant>
            <CardHeader>
              <CardTitle>Platform Users</CardTitle>
              <CardDescription>Manage and monitor all registered users</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-neutral-200/50">
                      <th className="text-left py-3 px-4 font-semibold text-neutral-700">Name</th>
                      <th className="text-left py-3 px-4 font-semibold text-neutral-700">Email</th>
                      <th className="text-left py-3 px-4 font-semibold text-neutral-700">Role</th>
                      <th className="text-left py-3 px-4 font-semibold text-neutral-700">Contests</th>
                      <th className="text-left py-3 px-4 font-semibold text-neutral-700">Submissions</th>
                      <th className="text-left py-3 px-4 font-semibold text-neutral-700">Joined</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id} className="border-b border-neutral-200/30 hover:bg-white/30 transition-colors">
                        <td className="py-3 px-4 font-medium text-neutral-900">{user.name}</td>
                        <td className="py-3 px-4 text-neutral-600">{user.email}</td>
                        <td className="py-3 px-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            user.role === 'USER' 
                              ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                              : 'bg-purple-100 text-purple-700 border border-purple-200'
                          }`}>
                            {user.role === 'USER' ? 'Business Owner' : 'Designer'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-neutral-600">{user._count.contests}</td>
                        <td className="py-3 px-4 text-neutral-600">{user._count.submissions}</td>
                        <td className="py-3 px-4 text-neutral-600">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </CardVibrant>
        )}

        {/* Contests Tab */}
        {activeTab === 'contests' && (
          <CardVibrant>
            <CardHeader>
              <CardTitle>Platform Contests</CardTitle>
              <CardDescription>Monitor all contests and their status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-neutral-200/50">
                      <th className="text-left py-3 px-4 font-semibold text-neutral-700">Title</th>
                      <th className="text-left py-3 px-4 font-semibold text-neutral-700">Owner</th>
                      <th className="text-left py-3 px-4 font-semibold text-neutral-700">Platform</th>
                      <th className="text-left py-3 px-4 font-semibold text-neutral-700">Status</th>
                      <th className="text-left py-3 px-4 font-semibold text-neutral-700">Submissions</th>
                      <th className="text-left py-3 px-4 font-semibold text-neutral-700">Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    {contests.map((contest) => (
                      <tr key={contest.id} className="border-b border-neutral-200/30 hover:bg-white/30 transition-colors">
                        <td className="py-3 px-4 font-medium text-neutral-900">{contest.title}</td>
                        <td className="py-3 px-4 text-neutral-600">{contest.user.name}</td>
                        <td className="py-3 px-4">
                          <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 border border-blue-200">
                            {contest.platform}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            contest.status === 'ACTIVE' ? 'bg-green-100 text-green-700 border border-green-200' :
                            contest.status === 'COMPLETED' ? 'bg-neutral-100 text-neutral-700 border border-neutral-200' :
                            contest.status === 'DRAFT' ? 'bg-yellow-100 text-yellow-700 border border-yellow-200' :
                            'bg-red-100 text-red-700 border border-red-200'
                          }`}>
                            {contest.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-neutral-600">{contest._count.submissions}</td>
                        <td className="py-3 px-4 text-neutral-600">
                          {new Date(contest.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </CardVibrant>
        )}
      </div>
    </div>
  );
}
