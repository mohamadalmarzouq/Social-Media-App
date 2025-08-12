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
  platform: 'LOGO' | 'INSTAGRAM' | 'TIKTOK';
  status: 'DRAFT' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  round: number;
  packageQuota: number;
  winnersNeeded: number;
  expectedSubmissions: number;
  acceptedCount: number;
  winningSubmissionId?: string;
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
  winningSubmission?: {
    id: string;
    designer: {
      name: string;
      email: string;
    };
    assets: any[];
  };
}

export default function ContestDetailPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const [contest, setContest] = useState<Contest | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [advancing, setAdvancing] = useState(false);
  const [selectingWinner, setSelectingWinner] = useState(false);
  const [round3Submissions, setRound3Submissions] = useState<any[]>([]);

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.role === 'DESIGNER') {
      router.push('/designer/dashboard');
      return;
    }
    
    if (status === 'authenticated' && params.id) {
      fetchContest();
    }
  }, [session, status, router, params.id]);

  useEffect(() => {
    if (contest && contest.round === 3 && contest.status === 'ACTIVE') {
      fetchRound3Submissions();
    }
  }, [contest]);

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

  const handleAdvanceRound = async () => {
    if (!confirm(`Are you sure you want to advance to ${getRoundName(contest!.round + 1)}? This will reset the accepted count and move all designers to the next round.`)) {
      return;
    }

    setAdvancing(true);
    try {
      const response = await fetch(`/api/contests/${params.id}/advance-round`, {
        method: 'POST',
      });

      if (response.ok) {
        const data = await response.json();
        // Refresh contest data
        await fetchContest();
        alert(data.message);
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Failed to advance round');
      }
    } catch (error) {
      console.error('Error advancing round:', error);
      alert('An error occurred while advancing the round');
    } finally {
      setAdvancing(false);
    }
  };

  const fetchRound3Submissions = async () => {
    try {
      const response = await fetch(`/api/contests/${params.id}/submissions`);
      if (response.ok) {
        const data = await response.json();
        // Look for accepted submissions from ANY round, not just Round 3
        // Since we don't create duplicate submissions when advancing rounds
        const acceptedSubmissions = data.submissions.filter(
          (s: any) => s.status === 'ACCEPTED'
        );
        setRound3Submissions(acceptedSubmissions);
      }
    } catch (error) {
      console.error('Error fetching accepted submissions:', error);
    }
  };

  const handleSelectWinner = async (submissionId: string) => {
    if (!confirm('Are you sure you want to select this design as the winner? This will complete the contest and cannot be undone.')) {
      return;
    }

    setSelectingWinner(true);
    try {
      const response = await fetch(`/api/contests/${params.id}/select-winner`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ submissionId }),
      });

      if (response.ok) {
        const data = await response.json();
        await fetchContest();
        alert(data.message);
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Failed to select winner');
      }
    } catch (error) {
      console.error('Error selecting winner:', error);
      alert('An error occurred while selecting the winner');
    } finally {
      setSelectingWinner(false);
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
  
  // Check if contest can advance to next round
  const canAdvanceRound = contest.status === 'ACTIVE' && contest.round < 3 && contest.acceptedCount > 0;

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
              {canAdvanceRound && (
                <Button 
                  variant="secondary"
                  onClick={handleAdvanceRound}
                  disabled={advancing}
                >
                  {advancing ? 'Advancing...' : `Advance to ${getRoundName(contest.round + 1)}`}
                </Button>
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
                        {contest.platform === 'LOGO' ? 'Logo Design' :
                         contest.platform === 'INSTAGRAM' ? 'Instagram (1080×1080)' : 
                         'TikTok (1080×1920)'}
                      </div>
                    </div>
                    <div>
                      <span className="font-medium text-gray-900">Current Round:</span>
                      <div className="text-gray-700">{getRoundName(contest.round)}</div>
                    </div>
                    <div>
                      <span className="font-medium text-gray-900">Expected Submissions:</span>
                      <div className="text-gray-700">{contest.packageQuota}</div>
                    </div>
                    <div>
                      <span className="font-medium text-gray-900">Winners Needed:</span>
                      <div className="text-gray-700">{contest.winnersNeeded}</div>
                    </div>
                    <div>
                      <span className="font-medium text-gray-900">Accepted Submissions:</span>
                      <div className="text-gray-700">{contest.acceptedCount} (proceeding to final rounds)</div>
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
                      <span className="text-gray-600">Expected Submissions</span>
                      <span className="font-medium">{contest.packageQuota}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${Math.min((contest._count.submissions / contest.packageQuota) * 100, 100)}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Accepted Submissions</span>
                      <span className="font-medium">{contest.acceptedCount}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full" 
                        style={{ width: `${Math.min((contest.acceptedCount / contest.packageQuota) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                  
                  <div className="text-sm text-gray-600">
                    <p><strong>Package:</strong> Expect {contest.packageQuota} submissions, Get {contest.winnersNeeded} winner{contest.winnersNeeded !== 1 ? 's' : ''}</p>
                    <p className="mt-1"><strong>Current Status:</strong> {contest._count.submissions} submissions received, {contest.acceptedCount} accepted</p>
                  </div>

                  {contest.acceptedCount > 0 && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <p className="text-sm text-blue-700">
                        💡 You can advance to the next round now with {contest.acceptedCount} accepted submission{contest.acceptedCount !== 1 ? 's' : ''}, or wait for more submissions.
                      </p>
                      <p className="text-xs text-blue-600 mt-1">
                        Note: Accepted submissions will carry over to the next round.
                      </p>
                    </div>
                  )}
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

            {/* Winner Selection - Only show in Round 3 */}
            {contest.round === 3 && contest.status === 'ACTIVE' && (
              <Card className="border-green-200 bg-green-50">
                <CardHeader>
                  <CardTitle className="text-green-800">🏆 Select Winner</CardTitle>
                  <CardDescription className="text-green-700">
                    Choose the winning design to complete your contest
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {round3Submissions.length === 0 ? (
                    <div className="text-center py-4">
                      <p className="text-green-700 mb-3">No accepted designs yet.</p>
                      <p className="text-sm text-green-600">Review submissions and accept designs to proceed with winner selection.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <p className="text-sm text-green-700 mb-4">
                        You have {round3Submissions.length} accepted design(s). 
                        Select the winner to complete your contest.
                      </p>
                      {round3Submissions.map((submission) => (
                        <div key={submission.id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-green-200">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                              <span className="text-green-600 font-medium">D</span>
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">Design by {submission.designer?.name || 'Designer'}</p>
                              <p className="text-sm text-gray-600">Round {submission.round} Submission</p>
                            </div>
                          </div>
                          <Button
                            onClick={() => handleSelectWinner(submission.id)}
                            disabled={selectingWinner}
                            className="bg-green-600 hover:bg-green-700 text-white"
                          >
                            {selectingWinner ? 'Selecting...' : 'Select as Winner'}
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Winning Design Display - Show when contest is completed */}
            {contest.status === 'COMPLETED' && contest.winningSubmission && (
              <Card className="border-yellow-200 bg-yellow-50">
                <CardHeader>
                  <CardTitle className="text-yellow-800">🏆 Winning Design</CardTitle>
                  <CardDescription className="text-yellow-700">
                    Congratulations! Your contest has been completed.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-yellow-200">
                      <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                        <span className="text-yellow-600 font-medium text-lg">👑</span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          Winner: {contest.winningSubmission.designer.name}
                        </p>
                        <p className="text-sm text-gray-600">
                          {contest.winningSubmission.designer.email}
                        </p>
                      </div>
                    </div>
                    <div className="text-sm text-yellow-700">
                      <p>This design has been saved to your portal and the contest is now complete.</p>
                      <p className="mt-2">You can view the full design details in your submissions review.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Round Advancement Rules */}
            {contest.status === 'ACTIVE' && (
              <Card className="border-blue-200 bg-blue-50">
                <CardHeader>
                  <CardTitle className="text-blue-800">Round Advancement</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-blue-700 space-y-2">
                    <p>• You can advance to the next round with any number of accepted submissions</p>
                    <p>• Accepted submissions automatically carry over to the next round</p>
                    <p>• Designers can continue working on accepted submissions in subsequent rounds</p>
                    <p>• Round 3 is for final winner selection (you need {contest.winnersNeeded} winner{contest.winnersNeeded !== 1 ? 's' : ''})</p>
                    <p>• Package: Expect {contest.packageQuota} submissions, Get {contest.winnersNeeded} winner{contest.winnersNeeded !== 1 ? 's' : ''}</p>
                  </div>
                </CardContent>
              </Card>
            )}

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
                  {canAdvanceRound && (
                    <Button 
                      variant="secondary"
                      onClick={handleAdvanceRound}
                      disabled={advancing}
                      className="w-full"
                    >
                      {advancing ? 'Advancing...' : `Advance to ${getRoundName(contest.round + 1)}`}
                    </Button>
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
