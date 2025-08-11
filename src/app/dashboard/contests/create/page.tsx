'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { contestSchema, type ContestInput } from '@/lib/validations/contest';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ColorPicker } from '@/components/ui/color-picker';
import { FontPicker } from '@/components/ui/font-picker';

export default function CreateContestPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<ContestInput>({
    resolver: zodResolver(contestSchema),
    defaultValues: {
      platform: 'LOGO',
      fileType: 'STATIC_POST',
      packageType: 'PACKAGE_1',
      packageQuota: 1,
      expectedSubmissions: 30,
      brandData: {
        colors: [],
        fonts: [],
      },
    },
  });

  const [colors, setColors] = useState<string[]>([]);
  const [fonts, setFonts] = useState<string[]>([]);

  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  if (status === 'unauthenticated') {
    router.push('/auth/signin');
    return null;
  }

  if (session?.user?.role !== 'USER') {
    router.push('/dashboard');
    return null;
  }

  // Update form values when colors/fonts change
  const handleColorsChange = (newColors: string[]) => {
    setColors(newColors);
    setValue('brandData.colors', newColors);
  };

  const handleFontsChange = (newFonts: string[]) => {
    setFonts(newFonts);
    setValue('brandData.fonts', newFonts);
  };

  // Handle package type change to update expected submissions
  const handlePackageTypeChange = (packageType: 'PACKAGE_1' | 'PACKAGE_2' | 'PACKAGE_3') => {
    setValue('packageType', packageType);
    
    // Update expected submissions and package quota based on package type
    switch (packageType) {
      case 'PACKAGE_1':
        setValue('expectedSubmissions', 30);
        setValue('packageQuota', 1);
        break;
      case 'PACKAGE_2':
        setValue('expectedSubmissions', 60);
        setValue('packageQuota', 2);
        break;
      case 'PACKAGE_3':
        setValue('expectedSubmissions', 90);
        setValue('packageQuota', 3);
        break;
    }
  };

  const onSubmit = async (data: ContestInput) => {
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/contests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to create contest');
        return;
      }

      const result = await response.json();
      router.push(`/dashboard/contests/${result.contest.id}`);
    } catch (error) {
      console.error('Error creating contest:', error);
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const watchedPackageType = watch('packageType');

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              onClick={() => router.back()}
              className="p-2"
            >
              ← Back
            </Button>
            <h1 className="text-2xl font-bold text-gray-900">Create Contest</h1>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
              {error}
            </div>
          )}

          {/* Contest Details */}
          <Card>
            <CardHeader>
              <CardTitle>Contest Details</CardTitle>
              <CardDescription>
                Provide the basic information about your contest
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contest Title
                </label>
                <Input
                  {...register('title')}
                  placeholder="e.g., Logo Design for Tech Startup"
                  className={errors.title ? 'border-red-500' : ''}
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description (Optional)
                </label>
                <textarea
                  {...register('description')}
                  rows={4}
                  placeholder="Describe what you're looking for, your target audience, style preferences, etc."
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.description ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Service
                  </label>
                  <select
                    {...register('platform')}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.platform ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Select service</option>
                    <option value="LOGO">Logo</option>
                    <option value="INSTAGRAM">Instagram (1080x1080)</option>
                    <option value="TIKTOK">TikTok (1080x1920)</option>
                  </select>
                  {errors.platform && (
                    <p className="mt-1 text-sm text-red-600">{errors.platform.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Files Needed
                  </label>
                  <select
                    {...register('fileType')}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.fileType ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Select file type</option>
                    <option value="STATIC_POST">Static Post</option>
                    <option value="ANIMATED_POST">Animated Post</option>
                  </select>
                  {errors.fileType && (
                    <p className="mt-1 text-sm text-red-600">{errors.fileType.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Package Type
                  </label>
                  <select
                    {...register('packageType')}
                    onChange={(e) => handlePackageTypeChange(e.target.value as 'PACKAGE_1' | 'PACKAGE_2' | 'PACKAGE_3')}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.packageType ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Select package</option>
                    <option value="PACKAGE_1">Package 1 (Expect 30, Get 1)</option>
                    <option value="PACKAGE_2">Package 2 (Expect 60, Get 2)</option>
                    <option value="PACKAGE_3">Package 3 (Expect 90, Get 3)</option>
                  </select>
                  {errors.packageType && (
                    <p className="mt-1 text-sm text-red-600">{errors.packageType.message}</p>
                  )}
                </div>
              </div>

              {/* Package Details Display */}
              {watchedPackageType && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-blue-900">Expected Submissions:</span>
                      <div className="text-blue-700">
                        {watchedPackageType === 'PACKAGE_1' ? '30' : 
                         watchedPackageType === 'PACKAGE_2' ? '60' : '90'}
                      </div>
                    </div>
                    <div>
                      <span className="font-medium text-blue-900">Final Designs:</span>
                      <div className="text-blue-700">
                        {watchedPackageType === 'PACKAGE_1' ? '1' : 
                         watchedPackageType === 'PACKAGE_2' ? '2' : '3'}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Brand Guidelines */}
          <Card>
            <CardHeader>
              <CardTitle>Brand Guidelines</CardTitle>
              <CardDescription>
                Upload your brand assets and provide style guidelines
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Brand Description
                </label>
                <textarea
                  {...register('brandData.description')}
                  rows={3}
                  placeholder="Describe your brand style, personality, and any specific requirements..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Brand Colors */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Brand Colors
                </label>
                <ColorPicker 
                  colors={colors} 
                  onChange={handleColorsChange}
                  maxColors={10}
                />
              </div>

              {/* Brand Fonts */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Brand Fonts
                </label>
                <FontPicker 
                  fonts={fonts} 
                  onChange={handleFontsChange}
                  maxFonts={5}
                />
              </div>
            </CardContent>
          </Card>

          {/* Submit */}
          <div className="flex justify-end gap-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => router.back()}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              variant="primary"
              disabled={isLoading}
            >
              {isLoading ? 'Creating Contest...' : 'Create Contest'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
