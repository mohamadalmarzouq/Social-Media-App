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
      } else {
        const errorData = await response.json();
        setError(errorData.error || `Failed to ${action.toLowerCase()} submission`);
      }
    } catch (error) {
      console.error(`Error ${action.toLowerCase()}ing submission:`, error);
      setError(`Failed to ${action.toLowerCase()} submission`);
    } finally {
      setUpdating(null);
    }
  };

  const handleAddComment = async (submissionId: string) => {
    const comment = newComments[submissionId];
    if (!comment || !comment.trim()) {
      setError('Please enter a comment');
      return;
    }

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
        // Clear the comment input and refresh data
        setNewComments(prev => ({ ...prev, [submissionId]: '' }));
        await fetchData();
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to add comment');
      }
    } catch (error) {
      console.error('Error adding comment:', error);
      setError('Failed to add comment');
    } finally {
      setCommenting(null);
    }
  };

  const handleCommentChange = (submissionId: string, value: string) => {
    setNewComments(prev => ({ ...prev, [submissionId]: value }));
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
          <p className="text-gray-600">Contest not found</p>
          <Link href="/dashboard/contests">
            <Button variant="outline" className="mt-4">Back to Contests</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm">
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
              <h1 className="text-2xl font-bold text-gray-900">Review Submissions</h1>
              <p className="text-gray-600">Contest: {contest.title}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-700">
                {contest.platform}
              </span>
              <span className="px-2 py-1 rounded-full text-sm font-medium bg-green-100 text-green-700">
                {contest.status}
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
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-600">Current Round</p>
                <p className="font-semibold">Round {contest.round}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Progress</p>
                <p className="font-semibold">{contest.acceptedCount}/{contest.packageQuota} designs accepted</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Submissions</p>
                <p className="font-semibold">{submissions.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Submissions */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-900">Designer Submissions</h2>
          
          {submissions.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-gray-500">No submissions yet for this contest.</p>
              </CardContent>
            </Card>
          ) : (
            submissions.map((submission) => (
              <Card key={submission.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">
                        {submission.designer.name}
                      </CardTitle>
                      <CardDescription>
                        Round {submission.round} • Submitted {new Date(submission.createdAt).toLocaleDateString()}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        submission.status === 'ACCEPTED' 
                          ? 'bg-green-100 text-green-700'
                          : submission.status === 'PASSED'
                          ? 'bg-orange-100 text-orange-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {submission.status}
                      </span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Design Files */}
                  {submission.assets.length > 0 && (
                    <div className="mb-4">
                      <h4 className="font-medium text-gray-900 mb-2">Design Files</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {submission.assets.map((asset) => (
                          <div key={asset.id} className="border rounded-lg overflow-hidden">
                            {asset.type === 'IMAGE' ? (
                              <img 
                                src={asset.url} 
                                alt={asset.filename}
                                className="w-full h-32 object-cover"
                              />
                            ) : (
                              <video 
                                src={asset.url} 
                                controls
                                className="w-full h-32 object-cover"
                              />
                            )}
                            <div className="p-2">
                              <p className="text-xs text-gray-600 truncate">{asset.filename}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Comments */}
                  <div className="mb-4">
                    <h4 className="font-medium text-gray-900 mb-2">Comments & Feedback</h4>
                    
                    {/* Existing Comments */}
                    {submission.comments.length > 0 && (
                      <div className="space-y-2 mb-4">
                        {submission.comments.map((comment) => (
                          <div key={comment.id} className="bg-gray-50 p-3 rounded-md">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm font-medium">{comment.author.name}</span>
                              <span className="text-xs text-gray-500">
                                {new Date(comment.createdAt).toLocaleDateString()}
                              </span>
                              <span className="text-xs text-gray-400">({comment.author.role})</span>
                            </div>
                            <p className="text-sm text-gray-700">{comment.message}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Add New Comment */}
                    <div className="border rounded-lg p-3 bg-white">
                      <div className="flex gap-2">
                        <Input
                          placeholder="Add feedback or comment for the designer..."
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
                        >
                          {commenting === submission.id ? 'Adding...' : 'Add Comment'}
                        </Button>
                      </div>
                    </div>
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
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
