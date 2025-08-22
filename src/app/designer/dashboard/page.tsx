'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardVibrant } from '@/components/ui/card';

interface Contest {
  id: string;
  title: string;
  platform: 'INSTAGRAM' | 'TIKTOK';
  status: 'ACTIVE' | 'COMPLETED';
  round: number;
  packageQuota: number;
  createdAt: string;
  _count: {
    submissions: number;
  };
}

interface Submission {
  id: string;
  contestId: string;
  contestTitle: string;
  status: 'PENDING' | 'ACCEPTED' | 'PASSED';
  createdAt: string;
}

export default function DesignerDashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [contests, setContests] = useState<Contest[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.role !== 'DESIGNER') {
      router.push('/dashboard');
      return;
    }
    
    if (status === 'authenticated') {
      fetchData();
    }
  }, [session, status, router]);

  const fetchData = async () => {
    try {
      const [contestsResponse, submissionsResponse] = await Promise.all([
        fetch('/api/contests/browse'),
        fetch('/api/designer/submissions')
      ]);

      if (contestsResponse.ok) {
        const contestsData = await contestsResponse.json();
        setContests(contestsData.contests);
      }

      if (submissionsResponse.ok) {
        const submissionsData = await submissionsResponse.json();
        setSubmissions(submissionsData.submissions);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
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

  const activeContests = contests.filter(c => c.status === 'ACTIVE');
  const acceptedSubmissions = submissions.filter(s => s.status === 'ACCEPTED');
  const pendingSubmissions = submissions.filter(s => s.status === 'PENDING');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header with glass morphism */}
      <div className="bg-gradient-to-r from-white/90 via-white/80 to-white/70 backdrop-blur-md border-b border-white/20 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold gradient-text-accent">Designer Dashboard</h1>
              <p className="text-lg text-neutral-600 mt-1">Welcome back, {session?.user?.name}</p>
            </div>
            <div className="flex gap-3">
              <Link href="/designer/work">
                <Button variant="outline" size="lg">My Work</Button>
              </Link>
              <Button 
                variant="outline" 
                size="lg"
                onClick={() => {
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
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="stat-card">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:shadow-xl transition-all duration-300">
                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-neutral-800 mb-2">Active Contests</h3>
              <div className="stat-number">{activeContests.length}</div>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:shadow-xl transition-all duration-300">
                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-neutral-800 mb-2">Accepted</h3>
              <div className="stat-number">{acceptedSubmissions.length}</div>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:shadow-xl transition-all duration-300">
                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-neutral-800 mb-2">Pending</h3>
              <div className="stat-number">{pendingSubmissions.length}</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:shadow-xl transition-all duration-300">
                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-neutral-800 mb-2">Total Submissions</h3>
              <div className="stat-number">{submissions.length}</div>
            </div>
          </div>
        </div>

        {/* Contest Browsing Section */}
        <CardVibrant className="mb-8">
          <CardHeader>
            <CardTitle>Browse Active Contests</CardTitle>
            <CardDescription>
              Find contests that match your skills and start creating amazing designs
            </CardDescription>
          </CardHeader>
          <CardContent>
            {activeContests.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-neutral-400 mb-4">
                  <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-neutral-900 mb-2">No active contests available</h3>
                <p className="text-neutral-600 mb-4">Check back later for new opportunities</p>
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
                          <div>Current Round: Round {contest.round}</div>
                          <div>Package Quota: {contest.packageQuota} designs needed</div>
                          <div>Submissions: {contest._count.submissions}</div>
                          <div>Created: {new Date(contest.createdAt).toLocaleDateString()}</div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Link href={`/designer/contests/${contest.id}`}>
                          <Button variant="primary" size="sm">View Details</Button>
                        </Link>
                        <Link href={`/designer/contests/${contest.id}/submit`}>
                          <Button variant="vibrant" size="sm">Submit Design</Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </CardVibrant>

        {/* Recent Submissions Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Recent Submissions</CardTitle>
            <CardDescription>
              Track the status of your recent design submissions
            </CardDescription>
          </CardHeader>
          <CardContent>
            {submissions.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-neutral-400 mb-4">
                  <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-neutral-900 mb-2">No submissions yet</h3>
                <p className="text-neutral-600 mb-4">Start by browsing active contests and submitting your designs</p>
                <Link href="/designer/contests">
                  <Button variant="vibrant">Browse Contests</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {submissions.slice(0, 5).map((submission) => (
                  <div key={submission.id} className="border border-neutral-200/50 rounded-2xl p-4 bg-white/80 backdrop-blur-sm hover:shadow-lg transition-all duration-300">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-neutral-900">{submission.contestTitle}</h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${
                            submission.status === 'ACCEPTED' ? 'bg-green-100 text-green-700 border-green-200' :
                            submission.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700 border-yellow-200' :
                            'bg-red-100 text-red-700 border-red-200'
                          }`}>
                            {submission.status}
                          </span>
                        </div>
                        <div className="text-sm text-neutral-600 space-y-1">
                          <div>Submitted: {new Date(submission.createdAt).toLocaleDateString()}</div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Link href={`/designer/submissions/${submission.id}`}>
                          <Button variant="outline" size="sm">View Details</Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
                {submissions.length > 5 && (
                  <div className="text-center pt-4">
                    <Link href="/designer/submissions">
                      <Button variant="outline">View All Submissions</Button>
                    </Link>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="mt-8">
          <CardVibrant>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Link href="/designer/contests" className="block">
                  <div className="border-2 border-dashed border-primary-300 rounded-2xl p-6 text-center hover:border-primary-500 hover:bg-primary-50/50 transition-all duration-300 group">
                    <div className="text-primary-600 mb-2 group-hover:scale-110 transition-transform duration-300">
                      <svg className="mx-auto h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                    <h3 className="font-medium text-neutral-900">Browse Contests</h3>
                    <p className="text-sm text-neutral-600">Find contests to participate in</p>
                  </div>
                </Link>
                
                <Link href="/designer/work" className="block">
                  <div className="border-2 border-dashed border-green-300 rounded-2xl p-6 text-center hover:border-green-500 hover:bg-green-50/50 transition-all duration-300 group">
                    <div className="text-green-600 mb-2 group-hover:scale-110 transition-transform duration-300">
                      <svg className="mx-auto h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <h3 className="font-medium text-neutral-900">My Portfolio</h3>
                    <p className="text-sm text-neutral-600">View your accepted work</p>
                  </div>
                </Link>
                
                <Link href="/designer/submissions" className="block">
                  <div className="border-2 border-dashed border-accent-300 rounded-2xl p-6 text-center hover:border-accent-500 hover:bg-accent-50/50 transition-all duration-300 group">
                    <div className="text-accent-600 mb-2 group-hover:scale-110 transition-transform duration-300">
                      <svg className="mx-auto h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </div>
                    <h3 className="font-medium text-neutral-900">My Submissions</h3>
                    <p className="text-sm text-neutral-600">Track your submissions</p>
                  </div>
                </Link>
              </div>
            </CardContent>
          </CardVibrant>
        </div>
      </div>
    </div>
  );
}
