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
  description: string;
  platform: 'INSTAGRAM' | 'TIKTOK';
  status: 'ACTIVE';
  round: number;
  packageQuota: number;
  expectedSubmissions: number;
  acceptedCount: number;
  createdAt: string;
  user: {
    name: string;
  };
  brand: {
    logoUrl: string | null;
    colors: string[];
    fonts: string[];
    description: string | null;
  };
  _count: {
    submissions: number;
  };
  userSubmission?: {
    id: string;
    round: number;
    status: 'PENDING' | 'ACCEPTED' | 'PASSED';
  } | null;
}

interface MySubmission {
  id: string;
  contest: {
    id: string;
    title: string;
    platform: string;
  };
  round: number;
  status: 'PENDING' | 'ACCEPTED' | 'PASSED';
  createdAt: string;
  assets: {
    id: string;
    url: string;
    type: string;
  }[];
  comments: {
    id: string;
    message: string;
    createdAt: string;
    author: {
      name: string;
      role: string;
    };
  }[];
}

export default function DesignerDashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [contests, setContests] = useState<Contest[]>([]);
  const [mySubmissions, setMySubmissions] = useState<MySubmission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.role === 'USER') {
      router.push('/dashboard');
      return;
    }
    
    if (status === 'authenticated') {
      fetchData();
    }
  }, [session, status, router]);

  const fetchData = async () => {
    try {
      const [contestsRes, submissionsRes] = await Promise.all([
        fetch('/api/contests/browse'),
        fetch('/api/designer/submissions')
      ]);

      if (contestsRes.ok) {
        const contestsData = await contestsRes.json();
        setContests(contestsData.contests);
      }

      if (submissionsRes.ok) {
        const submissionsData = await submissionsRes.json();
        setMySubmissions(submissionsData.submissions);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
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

  const acceptedSubmissions = mySubmissions.filter(s => s.status === 'ACCEPTED');
  const pendingSubmissions = mySubmissions.filter(s => s.status === 'PENDING');

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Designer Dashboard</h1>
              <p className="text-gray-600">Welcome back, {session?.user?.name}</p>
            </div>
            <div className="flex gap-3">
              <Link href="/designer/work">
                <Button variant="outline">My Work</Button>
              </Link>
              <Button 
                variant="outline" 
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
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Active Contests</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">{contests.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">My Submissions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600">{mySubmissions.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Accepted Designs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{acceptedSubmissions.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Pending Review</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-600">{pendingSubmissions.length}</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Browse Contests */}
          <Card>
            <CardHeader>
              <CardTitle>Browse Active Contests</CardTitle>
              <CardDescription>
                Find contests to participate in
              </CardDescription>
            </CardHeader>
            <CardContent>
              {contests.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-gray-400 mb-4">
                    <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No active contests</h3>
                  <p className="text-gray-600">Check back later for new opportunities</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {contests.slice(0, 5).map((contest) => (
                    <div key={contest.id} className="border rounded-lg p-4 hover:shadow-sm transition-shadow">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold text-gray-900">{contest.title}</h3>
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                          {contest.platform}
                        </span>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">{contest.description}</p>
                      
                      <div className="text-xs text-gray-500 mb-3">
                        <div>By {contest.user.name}</div>
                        <div>Round: {getRoundName(contest.round)}</div>
                        <div>Progress: {contest.acceptedCount}/{contest.packageQuota} accepted</div>
                      </div>

                      <div className="flex gap-2">
                        <Link href={`/designer/contests/${contest.id}`}>
                          <Button variant="outline" size="sm">View Details</Button>
                        </Link>
                        {contest.userSubmission ? (
                          contest.userSubmission.status === 'PASSED' ? (
                            <Link href={`/designer/contests/${contest.id}/submit`}>
                              <Button variant="primary" size="sm">Resubmit Design</Button>
                            </Link>
                          ) : (
                            <Button 
                              variant="secondary" 
                              size="sm"
                              disabled
                            >
                              {contest.userSubmission.status === 'PENDING' ? 'Submitted' : 'Accepted'}
                            </Button>
                          )
                        ) : (
                          <Link href={`/designer/contests/${contest.id}/submit`}>
                            <Button variant="primary" size="sm">Submit Design</Button>
                          </Link>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  {contests.length > 5 && (
                    <div className="text-center pt-4">
                      <Link href="/designer/contests">
                        <Button variant="outline">View All Contests</Button>
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Submissions */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Submissions</CardTitle>
              <CardDescription>
                Track your latest submissions and their status
              </CardDescription>
            </CardHeader>
            <CardContent>
              {mySubmissions.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-gray-400 mb-4">
                    <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No submissions yet</h3>
                  <p className="text-gray-600">Start by browsing and joining contests</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {mySubmissions.slice(0, 5).map((submission) => (
                    <div key={submission.id} className="border rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        {submission.assets.length > 0 && (
                          <div className="w-16 h-16 bg-gray-100 rounded flex-shrink-0 overflow-hidden">
                            {submission.assets[0].type === 'IMAGE' ? (
                              <img 
                                src={submission.assets[0].url} 
                                alt="Submission"
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <video 
                                src={submission.assets[0].url}
                                className="w-full h-full object-cover"
                              />
                            )}
                          </div>
                        )}
                        
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-gray-900 truncate">
                            {submission.contest.title}
                          </h4>
                          <div className="text-sm text-gray-600">
                            Round {submission.round} • {submission.contest.platform}
                          </div>
                          <div className="text-xs text-gray-500">
                            {formatDate(new Date(submission.createdAt))}
                          </div>
                          <div className="mt-2">
                            <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                              submission.status === 'ACCEPTED' ? 'bg-green-100 text-green-700' :
                              submission.status === 'PASSED' ? 'bg-red-100 text-red-700' :
                              'bg-yellow-100 text-yellow-700'
                            }`}>
                              {submission.status === 'PENDING' ? 'Under Review' : submission.status}
                            </span>
                            {submission.comments.length > 0 && (
                              <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                                💬 {submission.comments.length} feedback
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {mySubmissions.length > 5 && (
                    <div className="text-center pt-4">
                      <Link href="/designer/work">
                        <Button variant="outline">View All Submissions</Button>
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
