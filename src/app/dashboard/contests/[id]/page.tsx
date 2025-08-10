'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDate, getRoundName } from '@/lib/utils';

interface Contest {
  id: string;
  title: string;
  description: string;
  platform: 'INSTAGRAM' | 'TIKTOK';
  status: 'DRAFT' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  round: number;
  packageQuota: number;
  expectedSubmissions: number;
  acceptedCount: number;
  createdAt: string;
  brand: {
    logoUrl: string | null;
    colors: string[];
    fonts: string[];
    description: string | null;
  };
  _count: {
    submissions: number;
  };
}

export default function ContestDetailPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const [contest, setContest] = useState<Contest | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.role === 'DESIGNER') {
      router.push('/designer/dashboard');
      return;
    }
    
    if (status === 'authenticated' && params.id) {
      fetchContest();
    }
  }, [session, status, router, params.id]);

  const fetchContest = async () => {
    try {
      const response = await fetch(`/api/contests/${params.id}/details`);
      if (response.ok) {
        const data = await response.json();
        setContest(data.contest);
      }
    } catch (error) {
      console.error('Error fetching contest:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelContest = async () => {
    if (!confirm('Are you sure you want to cancel this contest? This action cannot be undone.')) {
      return;
    }

    setCancelling(true);
    try {
      const response = await fetch(`/api/contests/${params.id}/cancel`, {
        method: 'POST',
      });

      if (response.ok) {
        // Refresh contest data
        await fetchContest();
        alert('Contest cancelled successfully');
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Failed to cancel contest');
      }
    } catch (error) {
      console.error('Error cancelling contest:', error);
      alert('An error occurred while cancelling the contest');
    } finally {
      setCancelling(false);
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

  if (!contest) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Contest Not Found</h1>
          <p className="text-gray-600 mb-4">The contest you're looking for doesn't exist or is no longer available.</p>
          <Button onClick={() => router.push('/dashboard')}>
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  // Check if contest can be cancelled
  const canCancel = contest.status === 'ACTIVE' && contest.round === 1 && contest.acceptedCount === 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              onClick={() => router.push('/dashboard')}
              className="p-2"
            >
              ← Back to Dashboard
            </Button>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold text-gray-900">{contest.title}</h1>
                <span className={`px-2 py-1 rounded-full text-sm font-medium ${
                  contest.status === 'ACTIVE' ? 'bg-green-100 text-green-700' :
                  contest.status === 'COMPLETED' ? 'bg-gray-100 text-gray-700' :
                  contest.status === 'CANCELLED' ? 'bg-red-100 text-red-700' :
                  'bg-yellow-100 text-yellow-700'
                }`}>
                  {contest.status}
                </span>
                <span className="px-2 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-700">
                  {contest.platform}
                </span>
              </div>
              <p className="text-gray-600">Created on {formatDate(new Date(contest.createdAt))}</p>
            </div>
            <div className="flex gap-2">
              {contest.status === 'ACTIVE' && (
                <Link href={`/dashboard/contests/${contest.id}/review`}>
                  <Button variant="primary">Review Submissions</Button>
                </Link>
              )}
              {canCancel && (
                <Button 
                  variant="destructive"
                  onClick={handleCancelContest}
                  disabled={cancelling}
                >
                  {cancelling ? 'Cancelling...' : 'Cancel Contest'}
                </Button>
              )}
              {contest.status === 'CANCELLED' && (
                <div className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">
                  Contest cancelled
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Contest Details */}
            <Card>
              <CardHeader>
                <CardTitle>Contest Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {contest.description && (
                    <div>
                      <h3 className="font-medium text-gray-900 mb-2">Description</h3>
                      <p className="text-gray-700 whitespace-pre-wrap">{contest.description}</p>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-900">Platform:</span>
                      <div className="text-gray-700">
                        {contest.platform} 
                        {contest.platform === 'INSTAGRAM' ? ' (1080×1080)' : ' (1080×1920)'}
                      </div>
                    </div>
                    <div>
                      <span className="font-medium text-gray-900">Current Round:</span>
                      <div className="text-gray-700">{getRoundName(contest.round)}</div>
                    </div>
                    <div>
                      <span className="font-medium text-gray-900">Designs Needed:</span>
                      <div className="text-gray-700">{contest.packageQuota}</div>
                    </div>
                    <div>
                      <span className="font-medium text-gray-900">Progress:</span>
                      <div className="text-gray-700">{contest.acceptedCount}/{contest.packageQuota} accepted</div>
                    </div>
                    <div>
                      <span className="font-medium text-gray-900">Total Submissions:</span>
                      <div className="text-gray-700">{contest._count.submissions}</div>
                    </div>
                    <div>
                      <span className="font-medium text-gray-900">Created:</span>
                      <div className="text-gray-700">{formatDate(new Date(contest.createdAt))}</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Brand Guidelines */}
            <Card>
              <CardHeader>
                <CardTitle>Brand Guidelines</CardTitle>
                <CardDescription>
                  Brand information for designers
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {contest.brand.description && (
                    <div>
                      <h3 className="font-medium text-gray-900 mb-2">Brand Description</h3>
                      <p className="text-gray-700 whitespace-pre-wrap">{contest.brand.description}</p>
                    </div>
                  )}

                  {contest.brand.colors.length > 0 && (
                    <div>
                      <h3 className="font-medium text-gray-900 mb-3">Brand Colors</h3>
                      <div className="flex flex-wrap gap-3">
                        {contest.brand.colors.map((color, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <div 
                              className="w-8 h-8 rounded border border-gray-300" 
                              style={{ backgroundColor: color }}
                            />
                            <span className="text-sm font-mono text-gray-700">{color}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {contest.brand.fonts.length > 0 && (
                    <div>
                      <h3 className="font-medium text-gray-900 mb-3">Brand Fonts</h3>
                      <div className="flex flex-wrap gap-2">
                        {contest.brand.fonts.map((font, index) => (
                          <span 
                            key={index} 
                            className="px-3 py-1 bg-gray-100 rounded-lg text-sm text-gray-700"
                          >
                            {font}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {contest.brand.logoUrl && (
                    <div>
                      <h3 className="font-medium text-gray-900 mb-3">Logo</h3>
                      <div className="inline-block border border-gray-200 rounded-lg p-4 bg-white">
                        <img 
                          src={contest.brand.logoUrl} 
                          alt="Brand logo"
                          className="max-w-32 max-h-32 object-contain"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            {/* Contest Progress */}
            <Card>
              <CardHeader>
                <CardTitle>Contest Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Accepted Designs</span>
                      <span className="font-medium">{contest.acceptedCount}/{contest.packageQuota}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full" 
                        style={{ width: `${(contest.acceptedCount / contest.packageQuota) * 100}%` }}
                      />
                    </div>
                  </div>
                  
                  <div className="text-sm text-gray-600">
                    {contest.packageQuota - contest.acceptedCount} more design{contest.packageQuota - contest.acceptedCount !== 1 ? 's' : ''} needed
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Round Information */}
            <Card>
              <CardHeader>
                <CardTitle>Round Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-center w-12 h-12 mx-auto bg-blue-100 text-blue-600 rounded-full text-xl font-bold">
                    {contest.round}
                  </div>
                  <div className="text-center">
                    <h3 className="font-medium text-gray-900">{getRoundName(contest.round)}</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {contest.round === 1 && "Initial concept submissions"}
                      {contest.round === 2 && "Refinement based on feedback"}
                      {contest.round === 3 && "Final polished designs"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Cancellation Rules */}
            {contest.status === 'ACTIVE' && (
              <Card className="border-amber-200 bg-amber-50">
                <CardHeader>
                  <CardTitle className="text-amber-800">Cancellation Rules</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-amber-700 space-y-2">
                    <p>• Contest can only be cancelled before entering round 2</p>
                    <p>• Once designs are approved in round 1, cancellation is not allowed</p>
                    <p>• Cancellation is permanent and cannot be undone</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {contest.status === 'ACTIVE' && (
                    <Link href={`/dashboard/contests/${contest.id}/review`} className="block">
                      <Button variant="primary" className="w-full">
                        Review Submissions
                      </Button>
                    </Link>
                  )}
                  <Link href="/dashboard" className="block">
                    <Button variant="outline" className="w-full">
                      Back to Dashboard
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
