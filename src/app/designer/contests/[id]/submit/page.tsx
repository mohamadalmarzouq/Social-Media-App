'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

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
  logoFileTypes?: string[];
  user: {
    name: string;
  };
  brand: {
    logoUrl: string | null;
    colors: string[];
    fonts: string[];
    description: string | null;
  };
  userSubmission?: {
    id: string;
    round: number;
    status: 'PENDING' | 'ACCEPTED' | 'PASSED' | 'WINNER';
    modificationsAllowed?: boolean;
    modificationRequestedAt?: string;
  } | null;
}

export default function SubmitDesignPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const [contest, setContest] = useState<Contest | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [comment, setComment] = useState('');

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.role !== 'DESIGNER') {
      router.push('/dashboard');
      return;
    }
    
    if (status === 'authenticated') {
      fetchContest();
    }
  }, [session, status, router]);

  const fetchContest = async () => {
    try {
      const response = await fetch(`/api/contests/${params.id}/details`);
      if (response.ok) {
        const data = await response.json();
        console.log('Contest data received:', data); // Debug log
        console.log('User submission:', data.contest.userSubmission); // Debug log
        setContest(data.contest);
      } else {
        setError('Failed to fetch contest details');
      }
    } catch (error) {
      console.error('Error fetching contest:', error);
      setError('Failed to fetch contest details');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      setFiles(selectedFiles);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (files.length === 0) {
      setError('Please select at least one design file');
      return;
    }

    // For logo contests, validate that all required file types are covered ONLY for winners
    if (contest && 
        contest.platform === 'LOGO' && 
        contest.logoFileTypes && 
        contest.logoFileTypes.length > 0 && 
        contest.userSubmission?.status === 'WINNER') {
      
      // Check if the number of files matches the required file types
      if (files.length < contest.logoFileTypes.length) {
        setError(`As the winner, you must provide ${contest.logoFileTypes.length} files covering all required formats: ${contest.logoFileTypes.join(', ')}`);
        return;
      }
      
      // Additional validation: Check file extensions match required types
      const fileExtensions = files.map(file => {
        const ext = file.name.split('.').pop()?.toUpperCase();
        // Map common extensions to file types
        const extensionMap: { [key: string]: string } = {
          'AI': 'AI',
          'PSD': 'PSD', 
          'EPS': 'EPS',
          'PDF': 'PDF',
          'PNG': 'PNG',
          'JPG': 'JPG',
          'JPEG': 'JPG'
        };
        return extensionMap[ext || ''] || ext;
      });
      
      const missingTypes = contest.logoFileTypes.filter(type => 
        !fileExtensions.includes(type)
      );
      
      if (missingTypes.length > 0) {
        setError(`Missing required file types: ${missingTypes.length > 0 ? missingTypes.join(', ') : ''}. As the winner, you must provide files in all required formats.`);
        return;
      }
    }

    setSubmitting(true);
    setError('');

    try {
      // Check if this is a modification submission
      const isModification = contest?.userSubmission?.modificationsAllowed;
      
      // First, create a temporary submission to get an ID for file uploads
      const tempSubmissionResponse = await fetch('/api/submissions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contestId: params.id,
          comment,
          files: [], // Empty initially
          isModification: isModification || false,
        }),
      });

      if (!tempSubmissionResponse.ok) {
        const errorData = await tempSubmissionResponse.json();
        throw new Error(errorData.error || 'Failed to create submission');
      }

      const submissionData = await tempSubmissionResponse.json();
      const submissionId = submissionData.submission.id;

      // Upload files and collect their data
      const uploadedFiles = [];
      for (const file of files) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('submissionId', submissionId);
        formData.append('type', file.type.startsWith('image/') ? 'IMAGE' : 'VIDEO');

        const uploadResponse = await fetch('/api/files/upload', {
          method: 'POST',
          body: formData,
        });

        if (!uploadResponse.ok) {
          // If any file upload fails, delete the submission and show error
          await fetch(`/api/submissions/${submissionId}`, { method: 'DELETE' });
          throw new Error(`Failed to upload ${file.name}`);
        }

        const uploadData = await uploadResponse.json();
        uploadedFiles.push({
          id: uploadData.asset.id,
          url: uploadData.asset.url,
          filename: uploadData.asset.filename,
          type: uploadData.asset.type,
        });
      }

      // Now update the submission with the uploaded files data
      const updateResponse = await fetch(`/api/submissions/${submissionId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          files: uploadedFiles,
        }),
      });

      if (!updateResponse.ok) {
        throw new Error('Failed to update submission with files');
      }

      // Redirect to contest details page
      router.push(`/designer/contests/${params.id}`);
    } catch (error) {
      console.error('Error submitting design:', error);
      setError(error instanceof Error ? error.message : 'Failed to submit design');
    } finally {
      setSubmitting(false);
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
          <p className="text-gray-600">Contest not found</p>
          <Link href="/designer/dashboard">
            <Button variant="outline" className="mt-4">Back to Dashboard</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              onClick={() => router.push(`/designer/contests/${contest.id}`)}
              className="p-2"
            >
              ← Back to Contest
            </Button>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900">Submit Design</h1>
              <p className="text-gray-600">Contest: {contest.title}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contest Details */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Contest Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-900">{contest.title}</h3>
                  <p className="text-sm text-gray-600">{contest.description}</p>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                    {contest.platform}
                  </span>
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                    {contest.status}
                  </span>
                </div>

                <div className="text-sm text-gray-600">
                  <p>By: {contest.user.name}</p>
                  <p>Round: {contest.round}</p>
                  <p>Expected: {contest.expectedSubmissions} submissions</p>
                </div>

                {contest.brand && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Brand Guidelines</h4>
                    {contest.brand.colors.length > 0 && (
                      <div className="mb-2">
                        <p className="text-xs text-gray-600 mb-1">Colors:</p>
                        <div className="flex gap-1">
                          {contest.brand.colors.map((color, index) => (
                            <div
                              key={index}
                              className="w-6 h-6 rounded border"
                              style={{ backgroundColor: color }}
                              title={color}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                    {contest.brand.fonts.length > 0 && (
                      <div className="mb-2">
                        <p className="text-xs text-gray-600 mb-1">Fonts:</p>
                        <div className="space-y-1">
                          {contest.brand.fonts.map((font, index) => (
                            <p key={index} className="text-xs font-medium">{font}</p>
                          ))}
                        </div>
                      </div>
                    )}
                    {contest.brand.description && (
                      <div>
                        <p className="text-xs text-gray-600 mb-1">Description:</p>
                        <p className="text-xs">{contest.brand.description}</p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Submission Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>
                  {contest.userSubmission?.modificationsAllowed ? 'Submit Additional Files' : 'Submit Your Design'}
                </CardTitle>
                <CardDescription>
                  {contest.userSubmission?.modificationsAllowed 
                    ? 'Upload additional files addressing the client feedback while keeping your accepted submission'
                    : 'Upload your design files and add any comments for the client'
                  }
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Modification Notice */}
                {contest.userSubmission?.modificationsAllowed && (
                  <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-blue-900 mb-2">🎯 Modification Requested by Client</h4>
                        <p className="text-sm text-blue-800 mb-2">
                          The client has requested additional files or modifications to your <strong>ACCEPTED</strong> submission. 
                          You can now provide additional files based on their feedback.
                        </p>
                        <div className="text-xs text-blue-700 space-y-1">
                          <p>• <strong>Current Status:</strong> Your original submission remains accepted</p>
                          <p>• <strong>What to do:</strong> Upload additional files addressing the client's feedback</p>
                          <p>• <strong>When requested:</strong> {contest.userSubmission.modificationRequestedAt ? new Date(contest.userSubmission.modificationRequestedAt).toLocaleDateString() : 'Recently'}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Debug Information */}
                {process.env.NODE_ENV === 'development' && (
                  <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                    <h4 className="text-sm font-medium text-yellow-900 mb-2">🔍 Debug Info (Development Only)</h4>
                    <div className="text-xs text-yellow-800 space-y-1">
                      <p><strong>Submission Status:</strong> {contest.userSubmission?.status || 'None'}</p>
                      <p><strong>Modifications Allowed:</strong> {contest.userSubmission?.modificationsAllowed ? 'Yes' : 'No'}</p>
                      <p><strong>Modification Requested At:</strong> {contest.userSubmission?.modificationRequestedAt || 'Not set'}</p>
                      <p><strong>Has User Submission:</strong> {contest.userSubmission ? 'Yes' : 'No'}</p>
                    </div>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  {error && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                      <p className="text-sm text-red-600">{error}</p>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Design Files *
                    </label>
                    
                    {contest.platform === 'LOGO' && 
                     contest.logoFileTypes && 
                     contest.logoFileTypes.length > 0 && 
                     contest.userSubmission?.status === 'WINNER' && (
                      <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
                        <h4 className="text-sm font-medium text-blue-900 mb-2">🎉 Winner! Final File Delivery Required:</h4>
                        <div className="flex flex-wrap gap-2 mb-3">
                          {contest.logoFileTypes.map((fileType, index) => (
                            <span 
                              key={index} 
                              className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                            >
                              {fileType}
                            </span>
                          ))}
                        </div>
                        <p className="text-sm text-blue-700">
                          As the winner, you must provide <strong>{contest.logoFileTypes.length} file(s)</strong> covering all the required formats above. 
                          Each file should be the same logo design but in the specified format for final delivery.
                        </p>
                      </div>
                    )}
                    
                    {contest.platform === 'LOGO' && 
                     contest.logoFileTypes && 
                     contest.logoFileTypes.length > 0 && 
                     contest.userSubmission?.status !== 'WINNER' && (
                      <div className="mb-4 p-3 bg-gray-50 border border-gray-200 rounded-md">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">📝 Logo Contest - File Types Available:</h4>
                        <div className="flex flex-wrap gap-2 mb-2">
                          {contest.logoFileTypes.map((fileType, index) => (
                            <span 
                              key={index} 
                              className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs"
                            >
                              {fileType}
                            </span>
                          ))}
                        </div>
                        <p className="text-xs text-gray-600">
                          For initial submission, upload your logo design in any format. If selected as winner, you'll need to provide all required file types.
                        </p>
                      </div>
                    )}
                    
                    <Input
                      type="file"
                      multiple
                      accept="image/*,video/*,.ai,.psd,.eps,.pdf"
                      onChange={handleFileChange}
                      className="cursor-pointer"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {contest.platform === 'LOGO' && contest.userSubmission?.status === 'WINNER'
                        ? `Winner delivery: AI, PSD, EPS, PDF, PNG, JPG. Max ${contest.logoFileTypes?.length || 5} files.`
                        : contest.platform === 'LOGO'
                        ? 'Initial submission: Any format accepted. Winner will provide all required formats.'
                        : 'Supported formats: JPG, PNG, GIF, MP4, MOV. Max 5 files.'
                      }
                    </p>
                    {files.length > 0 && (
                      <div className="mt-2">
                        <p className="text-sm text-gray-600">Selected files:</p>
                        <ul className="text-xs text-gray-500 mt-1">
                          {files.map((file, index) => (
                            <li key={index}>{file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)</li>
                          ))}
                        </ul>
                        
                        {contest.platform === 'LOGO' && 
                         contest.logoFileTypes && 
                         contest.logoFileTypes.length > 0 && 
                         contest.userSubmission?.status === 'WINNER' && (
                          <div className="mt-3 p-3 bg-gray-50 border border-gray-200 rounded-md">
                            <p className="text-sm font-medium text-gray-700 mb-2">File Type Coverage (Winner Delivery):</p>
                            <div className="space-y-2">
                              {contest.logoFileTypes.map((requiredType) => {
                                const hasFile = files.some(file => {
                                  const ext = file.name.split('.').pop()?.toUpperCase();
                                  const extensionMap: { [key: string]: string } = {
                                    'AI': 'AI', 'PSD': 'PSD', 'EPS': 'EPS', 'PDF': 'PDF', 
                                    'PNG': 'PNG', 'JPG': 'JPG', 'JPEG': 'JPG'
                                  };
                                  return extensionMap[ext || ''] === requiredType;
                                });
                                
                                return (
                                  <div key={requiredType} className="flex items-center gap-2">
                                    <span className={`w-4 h-4 rounded-full ${hasFile ? 'bg-green-500' : 'bg-red-500'}`}></span>
                                    <span className={`text-sm ${hasFile ? 'text-green-700' : 'text-red-700'}`}>
                                      {requiredType} {hasFile ? '✓' : '✗'}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                            <p className="text-xs text-gray-600 mt-2">
                              {files.length >= contest.logoFileTypes.length 
                                ? 'All required file types covered! Ready for final delivery.'
                                : `Need ${contest.logoFileTypes.length - files.length} more file(s) for winner delivery`
                              }
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Comments (Optional)
                    </label>
                    <textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Add any comments about your design, inspiration, or technical details..."
                    />
                  </div>

                  <div className="flex gap-3">
                    <Button
                      type="submit"
                      disabled={
                        submitting || 
                        files.length === 0 || 
                        (contest.platform === 'LOGO' && 
                         contest.logoFileTypes && 
                         contest.logoFileTypes.length > 0 && 
                         contest.userSubmission?.status === 'WINNER' && 
                         files.length < contest.logoFileTypes.length)
                      }
                      className="flex-1"
                    >
                      {submitting 
                        ? 'Submitting...' 
                        : contest.userSubmission?.modificationsAllowed 
                          ? 'Submit Additional Files'
                          : 'Submit Design'
                      }
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => router.push(`/designer/contests/${contest.id}`)}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
