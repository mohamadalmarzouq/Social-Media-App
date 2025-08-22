'use client';

import { useAuth } from '@/lib/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardVibrant, CardSuccess } from '@/components/ui/card';
import { formatDate, getRoundName } from '@/lib/utils';

interface Contest {
  id: string;
  title: string;
  platform: 'INSTAGRAM' | 'TIKTOK';
  status: 'DRAFT' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  round: number;
  acceptedCount: number;
  packageQuota: number;
  createdAt: string;
  _count: {
    submissions: number;
  };
}

export default function DashboardPage() {
  const { user, status, signOut } = useAuth();
  const router = useRouter();
  const [contests, setContests] = useState<Contest[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'authenticated' && user?.role === 'DESIGNER') {
      router.push('/designer/dashboard');
      return;
    }
    
    if (status === 'authenticated') {
      fetchContests();
    }
  }, [user, status, router]);

  const fetchContests = async () => {
    try {
      const response = await fetch('/api/contests');
      if (response.ok) {
        const data = await response.json();
        setContests(data.contests);
      }
    } catch (error) {
      console.error('Error fetching contests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelContest = async (contestId: string) => {
    if (!confirm('Are you sure you want to cancel this contest? This action cannot be undone.')) {
      return;
    }

    setCancelling(contestId);
    try {
      const response = await fetch(`/api/contests/${contestId}/cancel`, {
        method: 'POST',
      });

      if (response.ok) {
        // Refresh contests to show updated status
        await fetchContests();
        alert('Contest cancelled successfully');
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Failed to cancel contest');
      }
    } catch (error) {
      console.error('Error cancelling contest:', error);
      alert('An error occurred while cancelling the contest');
    } finally {
      setCancelling(null);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="text-center">
          <div className="spinner-vibrant h-8 w-8 mx-auto"></div>
          <p className="mt-2 text-neutral-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    router.push('/auth/signin');
    return null;
  }

  // Separate contests by status
  const cancelledContests = contests.filter(c => c.status === 'CANCELLED');
  const activeContests = contests.filter(c => c.status === 'ACTIVE');
  const completedContests = contests.filter(c => c.status === 'COMPLETED');
  const draftContests = contests.filter(c => c.status === 'DRAFT');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header with glass morphism */}
      <div className="bg-gradient-to-r from-white/90 via-white/80 to-white/70 backdrop-blur-md border-b border-white/20 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold gradient-text-primary">Dashboard</h1>
              <p className="text-lg text-neutral-600 mt-1">Welcome back, {user?.name}</p>
            </div>
            <div className="flex gap-3">
              <Link href="/dashboard/contests/create">
                <Button variant="vibrant" size="lg">
                  Create Contest
                </Button>
              </Link>
              <Button 
                variant="glass" 
                size="lg"
                onClick={() => {
                  signOut();
                }}
              >
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="stat-card">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:shadow-xl transition-all duration-300">
                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-neutral-800 mb-2">Total Contests</h3>
              <div className="stat-number">{contests.length}</div>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:shadow-xl transition-all duration-300">
                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-neutral-800 mb-2">Active Contests</h3>
              <div className="stat-number">{activeContests.length}</div>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-neutral-400 to-neutral-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:shadow-xl transition-all duration-300">
                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-neutral-800 mb-2">Completed</h3>
              <div className="stat-number">{completedContests.length}</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-red-400 to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:shadow-xl transition-all duration-300">
                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-neutral-800 mb-2">Cancelled</h3>
              <div className="stat-number">{cancelledContests.length}</div>
            </div>
          </div>
        </div>

        {/* Cancelled Contests Section */}
        {cancelledContests.length > 0 && (
          <CardSuccess className="mb-8">
            <CardHeader>
              <CardTitle className="text-red-800">Cancelled Contests</CardTitle>
              <CardDescription className="text-red-600">
                These contests were cancelled and are no longer active
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {cancelledContests.map((contest) => (
                  <div key={contest.id} className="border border-red-200 rounded-2xl p-4 bg-white/80 backdrop-blur-sm">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-neutral-900">{contest.title}</h3>
                          <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700 border border-red-200">
                            CANCELLED
                          </span>
                          <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 border border-blue-200">
                            {contest.platform}
                          </span>
                        </div>
                        <div className="text-sm text-neutral-600 space-y-1">
                          <div>Last Round: {getRoundName(contest.round)}</div>
                          <div>Progress: {contest.acceptedCount}/{contest.packageQuota} designs accepted</div>
                          <div>Submissions: {contest._count.submissions}</div>
                          <div>Created: {formatDate(new Date(contest.createdAt))}</div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Link href={`/dashboard/contests/${contest.id}`}>
                          <Button variant="outline" size="sm">View Details</Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </CardSuccess>
        )}

        {/* Active Contests Section */}
        <CardVibrant className="mb-8">
          <CardHeader>
            <CardTitle>Active Contests</CardTitle>
            <CardDescription>
              Manage your active contests and review submissions
            </CardDescription>
          </CardHeader>
          <CardContent>
            {activeContests.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-neutral-400 mb-4">
                  <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-neutral-900 mb-2">No active contests</h3>
                <p className="text-neutral-600 mb-4">Get started by creating your first contest</p>
                <Link href="/dashboard/contests/create">
                  <Button variant="vibrant">Create Your First Contest</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {activeContests.map((contest) => (
                  <div key={contest.id} className="border border-neutral-200/50 rounded-2xl p-4 bg-white/80 backdrop-blur-sm hover:shadow-lg transition-all duration-300">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-neutral-900">{contest.title}</h3>
                          <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 border border-green-200">
                            {contest.status}
                          </span>
                          <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 border border-blue-200">
                            {contest.platform}
                          </span>
                        </div>
                        <div className="text-sm text-neutral-600 space-y-1">
                          <div>Current Round: {getRoundName(contest.round)}</div>
                          <div>Progress: {contest.acceptedCount}/{contest.packageQuota} designs accepted</div>
                          <div>Submissions: {contest._count.submissions}</div>
                          <div>Created: {formatDate(new Date(contest.createdAt))}</div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Link href={`/dashboard/contests/${contest.id}`}>
                          <Button variant="outline" size="sm">View Details</Button>
                        </Link>
                        <Link href={`/dashboard/contests/${contest.id}/review`}>
                          <Button variant="primary" size="sm">Review Submissions</Button>
                        </Link>
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => handleCancelContest(contest.id)}
                          disabled={cancelling === contest.id}
                        >
                          {cancelling === contest.id ? 'Cancelling...' : 'Cancel Contest'}
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </CardVibrant>

        {/* Other Contest Statuses */}
        {(completedContests.length > 0 || draftContests.length > 0) && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Other Contests</CardTitle>
              <CardDescription>
                Draft and completed contests
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[...draftContests, ...completedContests].map((contest) => (
                  <div key={contest.id} className="border border-neutral-200/50 rounded-2xl p-4 bg-white/80 backdrop-blur-sm hover:shadow-lg transition-all duration-300">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-neutral-900">{contest.title}</h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${
                            contest.status === 'COMPLETED' ? 'bg-neutral-100 text-neutral-700 border-neutral-200' :
                            'bg-yellow-100 text-yellow-700 border-yellow-200'
                          }`}>
                            {contest.status}
                          </span>
                          <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 border border-blue-200">
                            {contest.platform}
                          </span>
                        </div>
                        <div className="text-sm text-neutral-600 space-y-1">
                          <div>Current Round: {getRoundName(contest.round)}</div>
                          <div>Progress: {contest.acceptedCount}/{contest.packageQuota} designs accepted</div>
                          <div>Submissions: {contest._count.submissions}</div>
                          <div>Created: {formatDate(new Date(contest.createdAt))}</div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Link href={`/dashboard/contests/${contest.id}`}>
                          <Button variant="outline" size="sm">View Details</Button>
                        </Link>
                        {contest.status === 'ACTIVE' && (
                          <Link href={`/dashboard/contests/${contest.id}/review`}>
                            <Button variant="primary" size="sm">Review Submissions</Button>
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        <div className="mt-8">
          <CardVibrant>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Link href="/dashboard/contests/create" className="block">
                  <div className="border-2 border-dashed border-primary-300 rounded-2xl p-6 text-center hover:border-primary-500 hover:bg-primary-50/50 transition-all duration-300 group">
                    <div className="text-primary-600 mb-2 group-hover:scale-110 transition-transform duration-300">
                      <svg className="mx-auto h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </div>
                    <h3 className="font-medium text-neutral-900">Create New Contest</h3>
                    <p className="text-sm text-neutral-600">Start a new design contest</p>
                  </div>
                </Link>
                
                <Link href="/dashboard/work" className="block">
                  <div className="border-2 border-dashed border-green-300 rounded-2xl p-6 text-center hover:border-green-500 hover:bg-green-50/50 transition-all duration-300 group">
                    <div className="text-green-600 mb-2 group-hover:scale-110 transition-transform duration-300">
                      <svg className="mx-auto h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <h3 className="font-medium text-neutral-900">Your Work</h3>
                    <p className="text-sm text-neutral-600">View accepted designs</p>
                  </div>
                </Link>
                
                <div className="border-2 border-dashed border-neutral-300 rounded-2xl p-6 text-center opacity-50">
                  <div className="text-neutral-400 mb-2">
                    <svg className="mx-auto h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <h3 className="font-medium text-neutral-900">Analytics</h3>
                  <p className="text-sm text-neutral-600">Coming soon</p>
                </div>
              </div>
            </CardContent>
          </CardVibrant>
        </div>
      </div>
    </div>
  );
}
