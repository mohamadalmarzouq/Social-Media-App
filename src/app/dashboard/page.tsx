'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
  const { data: session, status } = useSession();
  const router = useRouter();
  const [contests, setContests] = useState<Contest[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.role === 'DESIGNER') {
      router.push('/designer/dashboard');
      return;
    }
    
    if (status === 'authenticated') {
      fetchContests();
    }
  }, [session, status, router]);

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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
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
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-600">Welcome back, {session?.user?.name}</p>
            </div>
            <div className="flex gap-3">
              <Link href="/dashboard/contests/create">
                <Button variant="primary">Create Contest</Button>
              </Link>
              <Button 
                variant="outline" 
                onClick={() => {
                  // Add sign out functionality
                  router.push('/api/auth/signout');
                }}
              >
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Total Contests</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">{contests.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Active Contests</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{activeContests.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Completed Contests</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-600">{completedContests.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Cancelled Contests</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600">{cancelledContests.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Cancelled Contests Section - Display at Top */}
        {cancelledContests.length > 0 && (
          <Card className="mb-8 border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="text-red-800">Cancelled Contests</CardTitle>
              <CardDescription className="text-red-600">
                These contests were cancelled and are no longer active
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {cancelledContests.map((contest) => (
                  <div key={contest.id} className="border border-red-200 rounded-lg p-4 bg-white">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">{contest.title}</h3>
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                            CANCELLED
                          </span>
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                            {contest.platform}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600 space-y-1">
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
          </Card>
        )}

        {/* Active Contests Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Active Contests</CardTitle>
            <CardDescription>
              Manage your active contests and review submissions
            </CardDescription>
          </CardHeader>
          <CardContent>
            {activeContests.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No active contests</h3>
                <p className="text-gray-600 mb-4">Get started by creating your first contest</p>
                <Link href="/dashboard/contests/create">
                  <Button variant="primary">Create Your First Contest</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {activeContests.map((contest) => (
                  <div key={contest.id} className="border rounded-lg p-4 hover:shadow-sm transition-shadow">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">{contest.title}</h3>
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                            {contest.status}
                          </span>
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                            {contest.platform}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600 space-y-1">
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
        </Card>

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
                  <div key={contest.id} className="border rounded-lg p-4 hover:shadow-sm transition-shadow">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">{contest.title}</h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            contest.status === 'COMPLETED' ? 'bg-gray-100 text-gray-700' :
                            'bg-yellow-100 text-yellow-700'
                          }`}>
                            {contest.status}
                          </span>
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                            {contest.platform}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600 space-y-1">
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

        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Link href="/dashboard/contests/create" className="block">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 hover:bg-blue-50 transition-colors">
                    <div className="text-blue-600 mb-2">
                      <svg className="mx-auto h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </div>
                    <h3 className="font-medium text-gray-900">Create New Contest</h3>
                    <p className="text-sm text-gray-600">Start a new design contest</p>
                  </div>
                </Link>
                
                <Link href="/dashboard/work" className="block">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-green-500 hover:bg-green-50 transition-colors">
                    <div className="text-green-600 mb-2">
                      <svg className="mx-auto h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <h3 className="font-medium text-gray-900">Your Work</h3>
                    <p className="text-sm text-gray-600">View accepted designs</p>
                  </div>
                </Link>
                
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center opacity-50">
                  <div className="text-gray-400 mb-2">
                    <svg className="mx-auto h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <h3 className="font-medium text-gray-900">Analytics</h3>
                  <p className="text-sm text-gray-600">Coming soon</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
