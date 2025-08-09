'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
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
  };
  assets: {
    id: string;
    url: string;
    type: string;
    filename: string;
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

export default function DesignerWorkPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'accepted' | 'pending' | 'passed'>('all');

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.role === 'USER') {
      router.push('/dashboard');
      return;
    }
    
    if (status === 'authenticated') {
      fetchSubmissions();
    }
  }, [session, status, router]);

  const fetchSubmissions = async () => {
    try {
      const response = await fetch('/api/designer/submissions');
      if (response.ok) {
        const data = await response.json();
        setSubmissions(data.submissions);
      }
    } catch (error) {
      console.error('Error fetching submissions:', error);
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

  const filteredSubmissions = submissions.filter(submission => {
    if (filter === 'all') return true;
    return submission.status.toLowerCase() === filter;
  });

  const acceptedCount = submissions.filter(s => s.status === 'ACCEPTED').length;
  const pendingCount = submissions.filter(s => s.status === 'PENDING').length;
  const passedCount = submissions.filter(s => s.status === 'PASSED').length;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              onClick={() => router.push('/designer/dashboard')}
              className="p-2"
            >
              ← Back to Dashboard
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">My Work</h1>
              <p className="text-gray-600">All your submissions and their status</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className={filter === 'all' ? 'ring-2 ring-blue-500' : 'cursor-pointer hover:shadow-md'}>
            <CardContent className="p-6" onClick={() => setFilter('all')}>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{submissions.length}</div>
                <div className="text-sm text-gray-600">Total Submissions</div>
              </div>
            </CardContent>
          </Card>
          
          <Card className={filter === 'accepted' ? 'ring-2 ring-green-500' : 'cursor-pointer hover:shadow-md'}>
            <CardContent className="p-6" onClick={() => setFilter('accepted')}>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{acceptedCount}</div>
                <div className="text-sm text-gray-600">Accepted</div>
              </div>
            </CardContent>
          </Card>
          
          <Card className={filter === 'pending' ? 'ring-2 ring-yellow-500' : 'cursor-pointer hover:shadow-md'}>
            <CardContent className="p-6" onClick={() => setFilter('pending')}>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">{pendingCount}</div>
                <div className="text-sm text-gray-600">Pending</div>
              </div>
            </CardContent>
          </Card>
          
          <Card className={filter === 'passed' ? 'ring-2 ring-red-500' : 'cursor-pointer hover:shadow-md'}>
            <CardContent className="p-6" onClick={() => setFilter('passed')}>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{passedCount}</div>
                <div className="text-sm text-gray-600">Passed</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Submissions */}
        {filteredSubmissions.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {filter === 'all' ? 'No submissions yet' : `No ${filter} submissions`}
              </h3>
              <p className="text-gray-600 mb-4">
                {filter === 'all' 
                  ? 'Start by browsing and joining contests' 
                  : `You don't have any ${filter} submissions yet`
                }
              </p>
              <Button 
                variant="primary"
                onClick={() => router.push('/designer/dashboard')}
              >
                Browse Contests
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSubmissions.map((submission) => (
              <Card key={submission.id} className="overflow-hidden">
                <div className="aspect-square bg-gray-100 relative">
                  {submission.assets.length > 0 && (
                    <>
                      {submission.assets[0].type === 'IMAGE' ? (
                        <img
                          src={submission.assets[0].url}
                          alt={submission.assets[0].filename}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <video
                          src={submission.assets[0].url}
                          className="w-full h-full object-cover"
                          controls
                        />
                      )}
                    </>
                  )}
                  
                  <div className="absolute top-2 left-2">
                    <span className="bg-black bg-opacity-75 text-white px-2 py-1 rounded text-xs">
                      {submission.contest.platform}
                    </span>
                  </div>
                  
                  <div className="absolute top-2 right-2">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      submission.status === 'ACCEPTED' ? 'bg-green-500 text-white' :
                      submission.status === 'PASSED' ? 'bg-red-500 text-white' :
                      'bg-yellow-500 text-white'
                    }`}>
                      {submission.status === 'PENDING' ? 'REVIEW' : submission.status}
                    </span>
                  </div>
                </div>
                
                <CardHeader>
                  <CardTitle className="text-lg">{submission.contest.title}</CardTitle>
                  <CardDescription>
                    {getRoundName(submission.round)} • {formatDate(new Date(submission.createdAt))}
                  </CardDescription>
                </CardHeader>
                
                <CardContent>
                  {submission.comments.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Latest Feedback:</h4>
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-sm text-gray-700 mb-1">
                          "{submission.comments[0].message}"
                        </p>
                        <p className="text-xs text-gray-500">
                          - {submission.comments[0].author.name}
                        </p>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        if (submission.assets.length > 0) {
                          window.open(submission.assets[0].url, '_blank');
                        }
                      }}
                    >
                      View
                    </Button>
                    
                    {submission.status === 'ACCEPTED' && (
                      <Button 
                        variant="primary" 
                        size="sm"
                        onClick={() => {
                          if (submission.assets.length > 0) {
                            const link = document.createElement('a');
                            link.href = submission.assets[0].url;
                            link.download = submission.assets[0].filename;
                            link.click();
                          }
                        }}
                      >
                        Download
                      </Button>
                    )}
                    
                    {submission.contest.status === 'ACTIVE' && submission.status === 'PASSED' && (
                      <Button 
                        variant="secondary" 
                        size="sm"
                        onClick={() => router.push(`/designer/contests/${submission.contest.id}/submit`)}
                      >
                        Resubmit
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
