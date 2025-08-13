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
  platform: 'LOGO' | 'INSTAGRAM' | 'TIKTOK';
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

// Image Viewer Modal Component
function ImageViewerModal({ 
  isOpen, 
  onClose, 
  asset 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  asset: Submission['assets'][0] | null; 
}) {
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (isOpen) {
      // Reset zoom and position when modal opens
      setZoom(1);
      setPosition({ x: 0, y: 0 });
      
      // Add keyboard event listeners
      const handleKeyDown = (e: KeyboardEvent) => {
        switch (e.key) {
          case 'Escape':
            onClose();
            break;
          case 'ArrowLeft':
            // Could implement previous/next image navigation here
            break;
          case 'ArrowRight':
            // Could implement previous/next image navigation here
            break;
          case '+':
          case '=':
            e.preventDefault();
            setZoom(prev => Math.min(prev + 0.25, 3));
            break;
          case '-':
            e.preventDefault();
            setZoom(prev => Math.max(prev - 0.25, 0.5));
            break;
          case '0':
            e.preventDefault();
            setZoom(1);
            setPosition({ x: 0, y: 0 });
            break;
        }
      };

      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, onClose]);

  if (!isOpen || !asset) return null;

  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoom <= 1) return;
    
    const startX = e.clientX - position.x;
    const startY = e.clientY - position.y;
    
    const handleMouseMove = (e: MouseEvent) => {
      setPosition({
        x: e.clientX - startX,
        y: e.clientY - startY
      });
    };
    
    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-95">
      <div className="relative w-full h-full flex items-center justify-center p-4">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-3 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-75 transition-all hover:scale-110"
          title="Close (Esc)"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Zoom Controls */}
        <div className="absolute top-4 left-4 z-10 flex items-center gap-2 bg-black bg-opacity-50 text-white rounded-lg p-2">
          <button
            onClick={() => setZoom(prev => Math.max(prev - 0.25, 0.5))}
            className="p-1 hover:bg-white hover:bg-opacity-20 rounded transition-colors"
            title="Zoom Out (-)"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
            </svg>
          </button>
          <span className="text-sm font-medium min-w-[3rem] text-center">
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={() => setZoom(prev => Math.min(prev + 0.25, 3))}
            className="p-1 hover:bg-white hover:bg-opacity-20 rounded transition-colors"
            title="Zoom In (=)"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
          <button
            onClick={() => {
              setZoom(1);
              setPosition({ x: 0, y: 0 });
            }}
            className="p-1 hover:bg-white hover:bg-opacity-20 rounded transition-colors"
            title="Reset Zoom (0)"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>

        {/* Image/Video Display */}
        <div 
          className="relative overflow-hidden cursor-grab active:cursor-grabbing"
          onMouseDown={handleMouseDown}
          onWheel={(e) => {
            e.preventDefault();
            const delta = e.deltaY > 0 ? -0.1 : 0.1;
            setZoom(prev => {
              const newZoom = Math.max(0.5, Math.min(3, prev + delta));
              // Adjust position to zoom towards mouse cursor
              if (newZoom !== prev) {
                const rect = e.currentTarget.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                
                setPosition(prevPos => ({
                  x: prevPos.x - (x * (newZoom - prev) / prev),
                  y: prevPos.y - (y * (newZoom - prev) / prev)
                }));
              }
              return newZoom;
            });
          }}
          style={{ 
            transform: `scale(${zoom}) translate(${position.x / zoom}px, ${position.y / zoom}px)`,
            transition: zoom === 1 ? 'transform 0.2s ease-out' : 'none'
          }}
        >
          {asset.type === 'IMAGE' ? (
            <img
              src={asset.url}
              alt={asset.filename}
              className="max-w-full max-h-full object-contain rounded-lg shadow-2xl select-none"
              style={{ 
                maxHeight: '90vh',
                maxWidth: '90vw'
              }}
              draggable={false}
            />
          ) : (
            <video
              src={asset.url}
              className="max-w-full max-h-full rounded-lg shadow-2xl"
              controls
              autoPlay
              style={{ 
                maxHeight: '90vh',
                maxWidth: '90vw'
              }}
            />
          )}
        </div>

        {/* File Info */}
        <div className="absolute bottom-4 left-4 bg-black bg-opacity-50 text-white px-4 py-3 rounded-lg backdrop-blur-sm">
          <p className="text-sm font-medium">{asset.filename}</p>
          <p className="text-xs opacity-75">{asset.type}</p>
          <p className="text-xs opacity-75 mt-1">
            Use mouse wheel or +/- keys to zoom, drag to pan when zoomed
          </p>
        </div>

        {/* Download Button */}
        <div className="absolute bottom-4 right-4">
          <Button
            onClick={() => {
              const link = document.createElement('a');
              link.href = asset.url;
              link.download = asset.filename;
              link.click();
            }}
            size="sm"
            className="bg-blue-600 hover:bg-blue-700 shadow-lg"
          >
            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Download
          </Button>
        </div>

        {/* Keyboard Shortcuts Help */}
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 text-white px-4 py-2 rounded-lg text-sm opacity-75 hover:opacity-100 transition-opacity">
          <span className="hidden sm:inline">Keyboard: Esc to close, +/- to zoom, 0 to reset, drag to pan</span>
          <span className="sm:hidden">Tap to zoom, drag to pan</span>
        </div>
      </div>
    </div>
  );
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
  const [selectedAsset, setSelectedAsset] = useState<Submission['assets'][0] | null>(null);

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
    if (!confirm(`Are you sure you want to ${action.toLowerCase()} this design?`)) {
      return;
    }

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

        {/* Design Evaluation Guide */}
        <Card className="mb-8 bg-green-50 border-green-200">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="font-medium text-green-900 mb-2">🔍 Enhanced Design Evaluation</h3>
                <p className="text-sm text-green-800 mb-2">
                  <strong>New Feature:</strong> Click on any design file to view it in full size with advanced controls for better evaluation.
                </p>
                <ul className="text-xs text-green-700 space-y-1">
                  <li>• <strong>Full-Size View:</strong> Click any design thumbnail to see the complete design without cropping</li>
                  <li>• <strong>Zoom & Pan:</strong> Use +/- keys or mouse wheel to zoom, drag to pan when zoomed in</li>
                  <li>• <strong>Keyboard Shortcuts:</strong> Esc to close, 0 to reset zoom, arrow keys for navigation</li>
                  <li>• <strong>Download:</strong> Download any design file directly from the viewer</li>
                  <li>• <strong>Comparison:</strong> Open all files in new tabs for side-by-side comparison</li>
                </ul>
                <p className="text-xs text-green-600 mt-2 font-medium">
                  💡 This helps you make informed decisions about which designs should proceed to the next round!
                </p>
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
                  <div className="mb-6">
                    <h4 className="font-medium text-gray-900 mb-3">Design Files</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {submission.assets.map((asset) => (
                        <div key={asset.id} className="relative group cursor-pointer bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-200">
                          {/* File Preview */}
                          <div className="relative">
                            {asset.type === 'IMAGE' ? (
                              <img
                                src={asset.url}
                                alt={asset.filename}
                                className="w-full h-48 object-cover hover:scale-105 transition-transform duration-200"
                                onClick={() => setSelectedAsset(asset)}
                              />
                            ) : (
                              <video
                                src={asset.url}
                                className="w-full h-48 object-cover hover:scale-105 transition-transform duration-200"
                                onClick={() => setSelectedAsset(asset)}
                              />
                            )}
                            
                            {/* Overlay with View Button */}
                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center">
                              <Button
                                onClick={() => setSelectedAsset(asset)}
                                variant="secondary"
                                size="sm"
                                className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 text-gray-800 hover:bg-white"
                              >
                                <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                                View Full Size
                              </Button>
                            </div>
                            
                            {/* File Type Badge */}
                            <div className="absolute top-2 left-2">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                asset.type === 'IMAGE' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
                              }`}>
                                {asset.type}
                              </span>
                            </div>
                          </div>
                          
                          {/* File Info */}
                          <div className="p-3">
                            <p className="text-sm font-medium text-gray-900 truncate mb-1" title={asset.filename}>
                              {asset.filename}
                            </p>
                            <div className="flex items-center justify-between">
                              <p className="text-xs text-gray-500">
                                Click to view full size
                              </p>
                              <Button
                                onClick={() => {
                                  const link = document.createElement('a');
                                  link.href = asset.url;
                                  link.download = asset.filename;
                                  link.click();
                                }}
                                variant="ghost"
                                size="sm"
                                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                              >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {/* Quick Actions */}
                    <div className="mt-4 flex items-center gap-3">
                      <p className="text-sm text-gray-600">
                        💡 <strong>Tip:</strong> Click on any design file to view it in full size for better evaluation
                      </p>
                      {submission.assets.length > 1 && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            // Open all files in new tabs for comparison
                            submission.assets.forEach(asset => {
                              window.open(asset.url, '_blank');
                            });
                          }}
                          className="text-blue-600 border-blue-200 hover:bg-blue-50"
                        >
                          <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                          Open All in Tabs
                        </Button>
                      )}
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

      {/* Image Viewer Modal */}
      {selectedAsset && (
        <ImageViewerModal
          isOpen={!!selectedAsset}
          onClose={() => setSelectedAsset(null)}
          asset={selectedAsset}
        />
      )}
    </div>
  );
}
