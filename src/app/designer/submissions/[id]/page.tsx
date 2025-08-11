'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDate, getRoundName } from '@/lib/utils';

interface Submission {
  id: string;
  round: number;
  status: 'PENDING' | 'ACCEPTED' | 'PASSED';
  createdAt: string;
  contest: {
    id: string;
    title: string;
    platform: string;
    status: string;
    description: string;
    user: {
      name: string;
    };
    brand: {
      logoUrl: string | null;
      colors: string[];
      fonts: string[];
      description: string | null;
    };
  };
  assets: {
    id: string;
    url: string;
    type: string;
    filename: string;
    fileSize: number;
    mimeType: string;
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

export default function SubmissionDetailPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.role === 'USER') {
      router.push('/dashboard');
      return;
    }
    
    if (status === 'authenticated' && params.id) {
      fetchSubmission();
    }
  }, [session, status, router, params.id]);

  const fetchSubmission = async () => {
    try {
      const response = await fetch(`/api/designer/submissions/${params.id}`);
      if (response.ok) {
        const data = await response.json();
        setSubmission(data.submission);
      } else {
        setError('Failed to fetch submission details');
      }
    } catch (error) {
      console.error('Error fetching submission:', error);
      setError('Failed to fetch submission details');
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

  if (!submission) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Submission Not Found</h1>
          <p className="text-gray-600 mb-4">The submission you're looking for doesn't exist or is no longer available.</p>
          <Button onClick={() => router.push('/designer/work')}>
            Back to My Work
          </Button>
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
              onClick={() => router.push('/designer/work')}
              className="p-2"
            >
              ← Back to My Work
            </Button>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900">Submission Details</h1>
              <p className="text-gray-600">Contest: {submission.contest.title}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-700">
                {submission.contest.platform}
              </span>
              <span className={`px-2 py-1 rounded-full text-sm font-medium ${
                submission.status === 'ACCEPTED' ? 'bg-green-100 text-green-700' :
                submission.status === 'PASSED' ? 'bg-red-100 text-red-700' :
                'bg-yellow-100 text-yellow-700'
              }`}>
                {submission.status}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Design Files */}
            <Card>
              <CardHeader>
                <CardTitle>Your Design Files</CardTitle>
                <CardDescription>
                  Round {submission.round} • {getRoundName(submission.round)}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {submission.assets.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {submission.assets.map((asset) => (
                      <div key={asset.id} className="border rounded-lg overflow-hidden">
                        {asset.type === 'IMAGE' ? (
                          <img 
                            src={asset.url} 
                            alt={asset.filename}
                            className="w-full h-48 object-cover"
                          />
                        ) : (
                          <video 
                            src={asset.url} 
                            controls
                            className="w-full h-48 object-cover"
                          />
                        )}
                        <div className="p-3">
                          <p className="text-sm font-medium text-gray-900 truncate">{asset.filename}</p>
                          <p className="text-xs text-gray-500">
                            {(asset.fileSize / 1024 / 1024).toFixed(2)} MB • {asset.mimeType}
                          </p>
                          <div className="flex gap-2 mt-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => window.open(asset.url, '_blank')}
                            >
                              View Full Size
                            </Button>
                            {submission.status === 'ACCEPTED' && (
                              <Button 
                                variant="primary" 
                                size="sm"
                                onClick={() => {
                                  const link = document.createElement('a');
                                  link.href = asset.url;
                                  link.download = asset.filename;
                                  link.click();
                                }}
                              >
                                Download
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="text-gray-400 mb-4">
                      <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No design files</h3>
                    <p className="text-gray-600">This submission doesn't have any design files attached.</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Client Feedback */}
            <Card>
              <CardHeader>
                <CardTitle>Client Feedback</CardTitle>
                <CardDescription>
                  Comments and feedback from the business owner
                </CardDescription>
              </CardHeader>
              <CardContent>
                {submission.comments.length > 0 ? (
                  <div className="space-y-4">
                    {submission.comments.map((comment) => (
                      <div key={comment.id} className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium text-blue-700">
                              {comment.author.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <span className="text-sm font-medium text-blue-900">{comment.author.name}</span>
                            <span className="text-xs text-blue-600 ml-2">({comment.author.role})</span>
                          </div>
                          <span className="text-xs text-blue-500 ml-auto">
                            {formatDate(new Date(comment.createdAt))}
                          </span>
                        </div>
                        <p className="text-blue-800 leading-relaxed">
                          {comment.message}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="text-gray-400 mb-4">
                      <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No feedback yet</h3>
                    <p className="text-gray-600">The business owner hasn't provided any feedback yet.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            {/* Contest Information */}
            <Card>
              <CardHeader>
                <CardTitle>Contest Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600">Contest Title</p>
                    <p className="font-medium">{submission.contest.title}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Platform</p>
                    <p className="font-medium">{submission.contest.platform}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Round</p>
                    <p className="font-medium">{getRoundName(submission.round)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Status</p>
                    <p className="font-medium">{submission.contest.status}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Submitted</p>
                    <p className="font-medium">{formatDate(new Date(submission.createdAt))}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Business Owner</p>
                    <p className="font-medium">{submission.contest.user.name}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Brand Guidelines */}
            {submission.contest.brand && (
              <Card>
                <CardHeader>
                  <CardTitle>Brand Guidelines</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {submission.contest.brand.description && (
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Description</p>
                        <p className="text-sm">{submission.contest.brand.description}</p>
                      </div>
                    )}
                    
                    {submission.contest.brand.colors.length > 0 && (
                      <div>
                        <p className="text-sm text-gray-600 mb-2">Brand Colors</p>
                        <div className="flex gap-2">
                          {submission.contest.brand.colors.map((color, index) => (
                            <div
                              key={index}
                              className="w-6 h-6 rounded border border-gray-300"
                              style={{ backgroundColor: color }}
                              title={color}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {submission.contest.brand.fonts.length > 0 && (
                      <div>
                        <p className="text-sm text-gray-600 mb-2">Brand Fonts</p>
                        <div className="space-y-1">
                          {submission.contest.brand.fonts.map((font, index) => (
                            <p key={index} className="text-sm font-medium">{font}</p>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Link href={`/designer/contests/${submission.contest.id}`}>
                    <Button variant="outline" className="w-full">
                      View Contest
                    </Button>
                  </Link>
                  
                  {submission.contest.status === 'ACTIVE' && submission.status === 'PASSED' && (
                    <Link href={`/designer/contests/${submission.contest.id}/submit`}>
                      <Button variant="primary" className="w-full">
                        Resubmit Design
                      </Button>
                    </Link>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
