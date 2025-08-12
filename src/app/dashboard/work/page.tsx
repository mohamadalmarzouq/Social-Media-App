'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDate } from '@/lib/utils';

interface WinningDesign {
  id: string;
  submission: {
    id: string;
    contest: {
      id: string;
      title: string;
      platform: string;
      round: number;
    };
    designer: {
      name: string;
      email: string;
    };
    round: number;
    createdAt: string;
  };
  assets: {
    id: string;
    url: string;
    filename: string;
    type: string;
    width: number;
    height: number;
    mimeType: string;
    fileSize: number;
  }[];
}

export default function YourWorkPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [winningDesigns, setWinningDesigns] = useState<WinningDesign[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.role === 'DESIGNER') {
      router.push('/designer/dashboard');
      return;
    }
    
    if (status === 'authenticated') {
      fetchWinningDesigns();
    }
  }, [session, status, router]);

  const fetchWinningDesigns = async () => {
    try {
      const response = await fetch('/api/work');
      if (response.ok) {
        const data = await response.json();
        setWinningDesigns(data.designs);
      }
    } catch (error) {
      console.error('Error fetching winning designs:', error);
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
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Your Winning Designs</h1>
              <p className="text-gray-600">All your contest-winning designs</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {winningDesigns.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No winning designs yet</h3>
              <p className="text-gray-600 mb-4">Once you complete contests and select winners, they&apos;ll appear here</p>
              <Button 
                variant="primary"
                onClick={() => router.push('/dashboard')}
              >
                Go to Dashboard
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {winningDesigns.map((design) => (
              <Card key={design.id} className="overflow-hidden">
                <div className="aspect-square bg-gray-100 relative">
                  {design.assets.length > 0 && design.assets[0].type === 'IMAGE' && (
                    <img
                      src={design.assets[0].url}
                      alt={design.assets[0].filename}
                      className="w-full h-full object-cover"
                    />
                  )}
                  {design.assets.length > 0 && design.assets[0].type === 'VIDEO' && (
                    <video
                      src={design.assets[0].url}
                      className="w-full h-full object-cover"
                      controls
                    />
                  )}
                  <div className="absolute top-2 right-2">
                    <span className="bg-black bg-opacity-75 text-white px-2 py-1 rounded text-xs">
                      {design.submission.contest.platform}
                    </span>
                  </div>
                </div>
                
                <CardHeader>
                  <CardTitle className="text-lg">{design.submission.contest.title}</CardTitle>
                  <CardDescription>
                    🏆 Winning Design by {design.submission.designer.name} • Round {design.submission.round}
                    <br />
                    <span className="text-xs text-gray-500">{design.submission.designer.email}</span>
                  </CardDescription>
                </CardHeader>
                
                <CardContent>
                  <div className="text-sm text-gray-600 mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium">
                        🏆 Winner
                      </span>
                      <span className="text-gray-500">
                        Selected: {formatDate(new Date(design.submission.createdAt))}
                      </span>
                    </div>
                    {design.assets.length > 0 && (
                      <div className="text-xs text-gray-500">
                        File: {design.assets[0].filename} ({Math.round(design.assets[0].fileSize / 1024)} KB)
                      </div>
                    )}
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        if (design.assets.length > 0) {
                          window.open(design.assets[0].url, '_blank');
                        }
                      }}
                    >
                      View Full Size
                    </Button>
                    <Button 
                      variant="primary" 
                      size="sm"
                      onClick={() => {
                        if (design.assets.length > 0) {
                          const link = document.createElement('a');
                          link.href = design.assets[0].url;
                          link.download = design.assets[0].filename;
                          link.click();
                        }
                      }}
                    >
                      Download
                    </Button>
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
