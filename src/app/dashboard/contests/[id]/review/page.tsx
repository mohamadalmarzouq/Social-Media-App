'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

interface Submission {
  id: string;
  round: number;
  status: 'PENDING' | 'ACCEPTED' | 'PASSED';
  createdAt: string;
  designer: {
    name: string;
    email: string;
  };
  assets: {
    id: string;
    url: string;
    filename: string;
    type: 'IMAGE' | 'VIDEO';
  }[];
  comments: {
    id: string;
    message: string;
    author: {
      name: string;
      role: string;
    };
    createdAt: string;
  }[];
}

interface Contest {
  id: string;
  title: string;
  description: string;
  platform: 'INSTAGRAM' | 'TIKTOK';
  status: string;
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
}

export default function ReviewSubmissionsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const [contest, setContest] = useState<Contest | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState<string | null>(null);
  const [commenting, setCommenting] = useState<string | null>(null);
  const [advancing, setAdvancing] = useState(false);
  const [newComments, setNewComments] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.role !== 'USER') {
      router.push('/designer/dashboard');
      return;
    }

    if (status === 'authenticated') {
      fetchData();
    }
  }, [session, status, router]);

  const fetchData = async () => {
    try {
      const [contestRes, submissionsRes] = await Promise.all([
        fetch(`/api/contests/${params.id}/details`),
        fetch(`/api/contests/${params.id}/submissions`)
      ]);

      if (contestRes.ok) {
        const contestData = await contestRes.json();
        setContest(contestData.contest);
      }

      if (submissionsRes.ok) {
        const submissionsData = await submissionsRes.json();
        setSubmissions(submissionsData.submissions);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmissionAction = async (submissionId: string, action: 'ACCEPT' | 'PASS') => {
    setUpdating(submissionId);
    try {
      const response = await fetch(`/api/submissions/${submissionId}/${action.toLowerCase()}`, {
        method: 'POST',
      });

      if (response.ok) {
        // Refresh data
        await fetchData();
        alert(`Design ${action.toLowerCase()}ed successfully`);
      } else {
        const errorData = await response.json();
        alert(errorData.error || `Failed to ${action.toLowerCase()} design`);
      }
    } catch (error) {
      console.error(`Error ${action.toLowerCase()}ing submission:`, error);
      alert(`An error occurred while ${action.toLowerCase()}ing the design`);
    } finally {
      setUpdating(null);
    }
  };

  const handleAddComment = async (submissionId: string) => {
    const comment = newComments[submissionId]?.trim();
    if (!comment) return;

    setCommenting(submissionId);
    try {
      const response = await fetch(`/api/submissions/${submissionId}/comment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: comment }),
      });

      if (response.ok) {
        // Clear comment input and refresh data
        setNewComments(prev => ({ ...prev, [submissionId]: '' }));
        await fetchData();
        alert('Comment added successfully');
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Failed to add comment');
      }
    } catch (error) {
      console.error('Error adding comment:', error);
      alert('An error occurred while adding the comment');
    } finally {
      setCommenting(null);
    }
  };

  const handleCommentChange = (submissionId: string, value: string) => {
    setNewComments(prev => ({ ...prev, [submissionId]: value }));
  };

  const handleAdvanceRound = async () => {
    if (!confirm(`Are you sure you want to advance to Round ${contest!.round + 1}? This will reset the accepted count and move all designers to the next round.`)) {
      return;
    }

    setAdvancing(true);
    try {
      const response = await fetch(`/api/contests/${contest!.id}/advance-round`, {
        method: 'POST',
      });

      if (response.ok) {
        const data = await response.json();
        // Refresh data
        await fetchData();
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

  // Calculate submission counts
  const pendingSubmissions = submissions.filter(s => s.status === 'PENDING').length;
  const acceptedSubmissions = submissions.filter(s => s.status === 'ACCEPTED').length;
  const passedSubmissions = submissions.filter(s => s.status === 'PASSED').length;

  // Check if contest can advance to next round
  const canAdvanceRound = contest.status === 'ACTIVE' && contest.round < 3 && acceptedSubmissions > 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => router.push(`/dashboard/contests/${contest.id}`)}
              className="p-2"
            >
              ← Back to Contest
            </Button>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900">Review All Submissions</h1>
              <p className="text-gray-600">Contest: {contest.title}</p>
              <p className="text-sm text-gray-500 mt-1">
                View and provide feedback on all designer submissions, including passed ones
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-700">
                {contest.platform}
              </span>
              <span className="px-2 py-1 rounded-full text-sm font-medium bg-green-100 text-green-700">
                {contest.status}
              </span>
              <span className="px-2 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-700">
                Round {contest.round}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Contest Summary */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Contest Summary</CardTitle>
            <CardDescription>
              Overview of all submissions and their current status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-600">Current Round</p>
                <p className="font-semibold">Round {contest.round}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Pending Review</p>
                <p className="font-semibold text-yellow-600">{pendingSubmissions}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Accepted</p>
                <p className="font-semibold text-green-600">{acceptedSubmissions}/{contest.packageQuota}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Passed (Can Resubmit)</p>
                <p className="font-semibold text-orange-600">{passedSubmissions}</p>
              </div>
            </div>

            {/* Round Advancement Section */}
            {canAdvanceRound && (
              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-blue-900 mb-1">Ready to Advance to Next Round?</h3>
                    <p className="text-sm text-blue-700">
                      You have {acceptedSubmissions} accepted design{acceptedSubmissions !== 1 ? 's' : ''} and can advance to Round {contest.round + 1}.
                      {contest.round + 1 === 3 && ' This will complete your contest.'}
                    </p>
                  </div>
                  <Button
                    variant="secondary"
                    onClick={handleAdvanceRound}
                    disabled={advancing}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {advancing ? 'Advancing...' : `Advance to Round ${contest.round + 1}`}
                  </Button>
                </div>
              </div>
            )}

            {contest.round === 3 && (
              <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <span className="text-green-600">✓</span>
                  <p className="text-sm text-green-700">
                    Contest is in the final round. Once you accept your desired number of designs, the contest will be completed.
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Helpful Information */}
        <Card className="mb-8 bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="font-medium text-blue-900 mb-2">💡 Pro Tip: Communicate with All Designers</h3>
                <p className="text-sm text-blue-800 mb-2">
                  Even for <strong>PASSED</strong> submissions, you can provide detailed feedback to help designers create better resubmissions. 
                  Clear communication improves the overall quality of your contest.
                </p>
                <ul className="text-xs text-blue-700 space-y-1">
                  <li>• <strong>PENDING:</strong> Review and decide to Accept or Pass</li>
                  <li>• <strong>ACCEPTED:</strong> Provide final feedback and approval</li>
                  <li>• <strong>PASSED:</strong> Give specific guidance for resubmission</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Round Advancement Rules */}
        {contest.status === 'ACTIVE' && (
          <Card className="mb-8 bg-purple-50 border-purple-200">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-4 h-4 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium text-purple-900 mb-2">🚀 Round Advancement Flexibility</h3>
                  <p className="text-sm text-purple-800 mb-2">
                    You don't need to wait for the full number of accepted designs to advance to the next round.
                  </p>
                  <ul className="text-xs text-purple-700 space-y-1">
                    <li>• <strong>Advance anytime:</strong> Move to next round with any number of accepted designs</li>
                    <li>• <strong>Reset progress:</strong> Accepted count resets for the new round</li>
                    <li>• <strong>Designer notification:</strong> All designers are notified to submit for the next round</li>
                    <li>• <strong>Round 3 completion:</strong> Automatically marks contest as completed</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Submissions */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-900">All Designer Submissions</h2>
          
          {submissions.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-gray-500">No submissions yet for this contest.</p>
              </CardContent>
            </Card>
          ) : (
            submissions.map((submission) => (
              <Card key={submission.id} className={`${
                submission.status === 'ACCEPTED' ? 'border-green-200 bg-green-50' :
                submission.status === 'PASSED' ? 'border-orange-200 bg-orange-50' :
                'border-gray-200'
              }`}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{submission.designer.name}</CardTitle>
                      <CardDescription>{submission.designer.email}</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        submission.status === 'ACCEPTED' ? 'bg-green-100 text-green-700' :
                        submission.status === 'PASSED' ? 'bg-orange-100 text-orange-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {submission.status}
                      </span>
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                        Round {submission.round}
                      </span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Design Files */}
                  <div className="mb-4">
                    <h4 className="font-medium text-gray-900 mb-2">Design Files</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {submission.assets.map((asset) => (
                        <div key={asset.id} className="relative">
                          {asset.type === 'IMAGE' ? (
                            <img
                              src={asset.url}
                              alt={asset.filename}
                              className="w-full h-24 object-cover rounded-lg border border-gray-200"
                            />
                          ) : (
                            <video
                              src={asset.url}
                              className="w-full h-24 object-cover rounded-lg border border-gray-200"
                              controls
                            />
                          )}
                          <p className="text-xs text-gray-600 mt-1 truncate">{asset.filename}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Comments */}
                  {submission.comments.length > 0 && (
                    <div className="mb-4">
                      <h4 className="font-medium text-gray-900 mb-2">Feedback & Comments</h4>
                      <div className="space-y-2">
                        {submission.comments.map((comment) => (
                          <div key={comment.id} className={`p-3 rounded-lg ${
                            comment.author.role === 'DESIGNER' ? 'bg-green-100' : 'bg-blue-100'
                          }`}>
                            <div className="flex items-center gap-2 mb-1">
                              <span className={`text-xs font-medium ${
                                comment.author.role === 'DESIGNER' ? 'text-green-800' : 'text-blue-800'
                              }`}>
                                {comment.author.name}
                              </span>
                              <span className="text-xs text-gray-500">
                                {new Date(comment.createdAt).toLocaleDateString()}
                              </span>
                              <span className={`text-xs ${
                                comment.author.role === 'DESIGNER' ? 'text-green-600' : 'text-blue-600'
                              }`}>
                                ({comment.author.role})
                              </span>
                            </div>
                            <p className={`text-sm ${
                              comment.author.role === 'DESIGNER' ? 'text-green-700' : 'text-blue-700'
                            }`}>
                              {comment.message}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Add New Comment */}
                  <div className="border rounded-lg p-3 bg-white">
                    <div className="flex gap-2">
                      <Input
                        placeholder={
                          submission.status === 'PASSED' 
                            ? "Provide specific feedback to help the designer improve their resubmission..."
                            : "Add feedback or comment for the designer..."
                        }
                        value={newComments[submission.id] || ''}
                        onChange={(e) => handleCommentChange(submission.id, e.target.value)}
                        className="flex-1"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            handleAddComment(submission.id);
                          }
                        }}
                      />
                      <Button
                        onClick={() => handleAddComment(submission.id)}
                        disabled={commenting === submission.id || !newComments[submission.id]?.trim()}
                        size="sm"
                        className={
                          submission.status === 'PASSED' 
                            ? 'bg-orange-600 hover:bg-orange-700' 
                            : 'bg-blue-600 hover:bg-blue-700'
                        }
                      >
                        {commenting === submission.id ? 'Adding...' : 'Add Comment'}
                      </Button>
                    </div>
                    {submission.status === 'PASSED' && (
                      <p className="text-xs text-orange-600 mt-2">
                        💡 Be specific about what needs improvement for better resubmissions
                      </p>
                    )}
                  </div>

                  {/* Action Buttons */}
                  {submission.status === 'PENDING' && (
                    <div className="flex gap-3 pt-4 border-t">
                      <Button
                        onClick={() => handleSubmissionAction(submission.id, 'ACCEPT')}
                        disabled={updating === submission.id}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        {updating === submission.id ? 'Processing...' : 'Accept Design'}
                      </Button>
                      <Button
                        onClick={() => handleSubmissionAction(submission.id, 'PASS')}
                        disabled={updating === submission.id}
                        variant="outline"
                        className="border-orange-300 text-orange-700 hover:bg-orange-50"
                      >
                        {updating === submission.id ? 'Processing...' : 'Pass Design'}
                      </Button>
                    </div>
                  )}

                  {/* Passed submission info */}
                  {submission.status === 'PASSED' && (
                    <div className="pt-4 border-t">
                      <p className="text-sm text-gray-600">
                        This designer can submit a new design for the next round. 
                        Your feedback above will help them improve their next submission.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
