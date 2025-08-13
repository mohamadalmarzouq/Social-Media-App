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
      packageQuota: 30,
      winnersNeeded: 1,
      expectedSubmissions: 30,
      logoFileTypes: [],
      brandData: {
        colors: [],
        fonts: [],
      },
    },
  });

  const [colors, setColors] = useState<string[]>([]);
  const [fonts, setFonts] = useState<string[]>([]);
  const [selectedService, setSelectedService] = useState<string>('LOGO');
  const [selectedLogoCategories, setSelectedLogoCategories] = useState<string[]>([]);

  // Logo file categories with descriptions
  const logoFileCategories = [
    {
      title: "Source Files",
      description: "These are the files designers create to build out the design. You'll need these files to make any future design changes.",
      files: ['AI', 'PSD', 'EPS']
    },
    {
      title: "Print Files", 
      description: "These files are ready to be printed on business cards, posters, t-shirts, merchandise and more. They are typically larger than digital files because printing requires higher resolution images.",
      files: ['PDF', 'EPS']
    },
    {
      title: "Digital Files",
      description: "These files can be used on websites, email, social media, video and more. They are typically smaller than print files.",
      files: ['PNG', 'JPG', 'PDF']
    }
  ];

  // Handle service change
  const handleServiceChange = (service: 'LOGO' | 'INSTAGRAM' | 'TIKTOK') => {
    setSelectedService(service);
    setValue('platform', service);
    
    // Reset file type when service changes
    if (service === 'LOGO') {
      setValue('fileType', 'STATIC_POST'); // Keep a valid default
      setSelectedLogoCategories([]);
      setValue('logoFileTypes', []); // Reset logo file types
    } else {
      setValue('fileType', 'STATIC_POST');
      setSelectedLogoCategories([]);
      setValue('logoFileTypes', []); // Reset logo file types
    }
  };

  // Handle logo category selection
  const handleLogoCategorySelection = (categoryTitle: string) => {
    const newSelection = selectedLogoCategories.includes(categoryTitle)
      ? selectedLogoCategories.filter(c => c !== categoryTitle)
      : [...selectedLogoCategories, categoryTitle];
    
    setSelectedLogoCategories(newSelection);
    
    // Collect all file types from selected categories
    const allSelectedFiles = newSelection.flatMap(categoryTitle => {
      const category = logoFileCategories.find(c => c.title === categoryTitle);
      return category ? category.files : [];
    });
    
    setValue('logoFileTypes', allSelectedFiles);
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-primary-50 dark:from-neutral-950 dark:via-neutral-900 dark:to-primary-950/20">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="spinner-modern w-12 h-12 mx-auto mb-4"></div>
            <p className="text-lg text-neutral-600 dark:text-neutral-400">Loading...</p>
          </div>
        </div>
      </div>
    );
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
    
    // Update expected submissions and winners needed based on package type
    if (selectedService === 'LOGO') {
      // Logo contests: all packages get 1 winner
      switch (packageType) {
        case 'PACKAGE_1':
          setValue('expectedSubmissions', 30);
          setValue('packageQuota', 30); // Expect 30 submissions
          setValue('winnersNeeded', 1); // Get 1 winner
          break;
        case 'PACKAGE_2':
          setValue('expectedSubmissions', 60);
          setValue('packageQuota', 60); // Expect 60 submissions
          setValue('winnersNeeded', 1); // Get 1 winner
          break;
        case 'PACKAGE_3':
          setValue('expectedSubmissions', 90);
          setValue('packageQuota', 90); // Expect 90 submissions
          setValue('winnersNeeded', 1); // Get 1 winner
          break;
      }
    } else {
      // Instagram/TikTok contests: packages get 1, 2, or 3 winners
      switch (packageType) {
        case 'PACKAGE_1':
          setValue('expectedSubmissions', 30);
          setValue('packageQuota', 30); // Expect 30 submissions
          setValue('winnersNeeded', 1); // Get 1 winner
          break;
        case 'PACKAGE_2':
          setValue('expectedSubmissions', 60);
          setValue('packageQuota', 60); // Expect 60 submissions
          setValue('winnersNeeded', 2); // Get 2 winners
          break;
        case 'PACKAGE_3':
          setValue('expectedSubmissions', 90);
          setValue('packageQuota', 90); // Expect 90 submissions
          setValue('winnersNeeded', 3); // Get 3 winners
          break;
      }
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
        body: JSON.stringify({
          ...data,
          logoFileTypes: data.platform === 'LOGO' ? data.logoFileTypes : undefined,
        }),
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
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-primary-50 dark:from-neutral-950 dark:via-neutral-900 dark:to-primary-950/20">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background Blobs */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blob rounded-full opacity-20"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blob-accent rounded-full opacity-20"></div>
        </div>
        
        <div className="relative bg-white/80 dark:bg-neutral-900/80 backdrop-blur-md border-b border-neutral-200/50 dark:border-neutral-700/50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                onClick={() => router.back()}
                className="p-2 rounded-2xl"
              >
                ← Back
              </Button>
              <div className="flex-1">
                <h1 className="text-4xl md:text-6xl font-heading font-bold bg-gradient-to-r from-primary-600 via-accent-600 to-primary-700 bg-clip-text text-transparent">
                  Create Contest
                </h1>
                <p className="text-xl text-neutral-600 dark:text-neutral-400 mt-2 opacity-70">
                  Launch your design contest and connect with talented designers
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-12">
          {error && (
            <div className="bg-danger-50 dark:bg-danger-950/50 border-2 border-danger-200 dark:border-danger-500/30 text-danger-700 dark:text-danger-300 px-6 py-4 rounded-2xl backdrop-blur-sm">
              <p className="font-medium">{error}</p>
            </div>
          )}

          {/* Contest Details */}
          <Card className="card-glass">
            <CardHeader>
              <CardTitle className="text-3xl">Contest Details</CardTitle>
              <CardDescription className="text-lg">
                Provide the basic information about your contest
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              <div>
                <label className="block text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-3">
                  Contest Title
                </label>
                <Input
                  {...register('title')}
                  placeholder="e.g., Logo Design for Tech Startup"
                  className={errors.title ? 'border-danger-500 focus:border-danger-500 focus:ring-danger-500/20' : ''}
                />
                {errors.title && (
                  <p className="mt-2 text-sm text-danger-600 dark:text-danger-400">{errors.title.message}</p>
                )}
              </div>

              <div>
                <label className="block text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-3">
                  Description (Optional)
                </label>
                <textarea
                  {...register('description')}
                  rows={4}
                  placeholder="Describe what you're looking for, your target audience, style preferences, etc."
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all duration-200 ${
                    errors.description ? 'border-danger-500' : 'border-neutral-200 dark:border-neutral-700 focus:border-primary-500'
                  } bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-500 dark:placeholder:text-neutral-400`}
                />
                {errors.description && (
                  <p className="mt-2 text-sm text-danger-600 dark:text-danger-400">{errors.description.message}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div>
                  <label className="block text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-3">
                    Service
                  </label>
                  <select
                    {...register('platform')}
                    onChange={(e) => handleServiceChange(e.target.value as 'LOGO' | 'INSTAGRAM' | 'TIKTOK')}
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all duration-200 ${
                      errors.platform ? 'border-danger-500' : 'border-neutral-200 dark:border-neutral-700 focus:border-primary-500'
                    } bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100`}
                  >
                    <option value="">Select service</option>
                    <option value="LOGO">Logo</option>
                    <option value="INSTAGRAM">Instagram (1080x1080)</option>
                    <option value="TIKTOK">TikTok (1080x1920)</option>
                  </select>
                  {errors.platform && (
                    <p className="mt-2 text-sm text-danger-600 dark:text-danger-400">{errors.platform.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-3">
                    Files Needed
                  </label>
                   {selectedService === 'LOGO' ? (
                     <div className="space-y-6">
                       {logoFileCategories.map((category) => (
                         <div key={category.title} className="space-y-4">
                           <div className="flex items-start gap-3 p-4 border-2 border-neutral-200 dark:border-neutral-700 rounded-xl hover:border-primary-300 dark:hover:border-primary-600 transition-colors">
                             <input
                               type="checkbox"
                               id={`logo-category-${category.title.replace(/\s+/g, '-')}`}
                               checked={selectedLogoCategories.includes(category.title)}
                               onChange={() => handleLogoCategorySelection(category.title)}
                               className="h-5 w-5 text-primary-600 focus:ring-primary-500 border-neutral-300 dark:border-neutral-600 dark:checked:bg-primary-600 rounded mt-1 flex-shrink-0"
                             />
                             <div className="flex-1">
                               <label htmlFor={`logo-category-${category.title.replace(/\s+/g, '-')}`} className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 cursor-pointer block mb-2">
                                 {category.title}
                               </label>
                               <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                                 {category.description}
                               </p>
                               <div className="mt-3 flex flex-wrap gap-2">
                                 {category.files.map((fileType) => (
                                   <span key={fileType} className="px-2 py-1 bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 text-xs rounded-md">
                                     {fileType}
                                   </span>
                                 ))}
                               </div>
                             </div>
                           </div>
                         </div>
                       ))}
                       {selectedLogoCategories.length > 0 && (
                         <div className="mt-6 p-4 bg-primary-50 dark:bg-primary-950/30 border border-primary-200 dark:border-primary-500/30 rounded-xl">
                           <p className="text-sm font-medium text-primary-900 dark:text-primary-100 mb-3">
                             Selected categories ({selectedLogoCategories.length}):
                           </p>
                           <div className="flex flex-wrap gap-2">
                             {selectedLogoCategories.map((categoryTitle) => (
                               <span key={categoryTitle} className="px-3 py-1 bg-primary-100 dark:bg-primary-800 text-primary-800 dark:text-primary-200 text-sm rounded-full font-medium">
                                 {categoryTitle}
                               </span>
                             ))}
                           </div>
                         </div>
                       )}
                     </div>
                   ) : (
                    <select
                      {...register('fileType')}
                      className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all duration-200 ${
                        errors.fileType ? 'border-danger-500' : 'border-neutral-200 dark:border-neutral-700 focus:border-primary-500'
                      } bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100`}
                    >
                      <option value="">Select file type</option>
                      <option value="STATIC_POST">Static Post</option>
                      <option value="ANIMATED_POST">Animated Post</option>
                    </select>
                  )}
                  {/* Hidden input to ensure logoFileTypes is properly registered */}
                  <input type="hidden" {...register('logoFileTypes')} />
                  {errors.fileType && (
                    <p className="mt-2 text-sm text-danger-600 dark:text-danger-400">{errors.fileType.message}</p>
                  )}
                  {errors.logoFileTypes && (
                    <p className="mt-2 text-sm text-danger-600 dark:text-danger-400">{errors.logoFileTypes.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-3">
                    Package Type
                  </label>
                  <select
                    {...register('packageType')}
                    onChange={(e) => handlePackageTypeChange(e.target.value as 'PACKAGE_1' | 'PACKAGE_2' | 'PACKAGE_3')}
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all duration-200 ${
                      errors.packageType ? 'border-danger-500' : 'border-neutral-200 dark:border-neutral-700 focus:border-primary-500'
                    } bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100`}
                  >
                    <option value="">Select package</option>
                    {selectedService === 'LOGO' ? (
                      <>
                        <option value="PACKAGE_1">Package 1 (Expect 30, Get 1)</option>
                        <option value="PACKAGE_2">Package 2 (Expect 60, Get 1)</option>
                        <option value="PACKAGE_3">Package 3 (Expect 90, Get 1)</option>
                      </>
                    ) : (
                      <>
                        <option value="PACKAGE_1">Package 1 (Expect 30, Get 1)</option>
                        <option value="PACKAGE_2">Package 2 (Expect 60, Get 2)</option>
                        <option value="PACKAGE_3">Package 3 (Expect 90, Get 3)</option>
                      </>
                    )}
                  </select>
                  {errors.packageType && (
                    <p className="mt-2 text-sm text-danger-600 dark:text-danger-400">{errors.packageType.message}</p>
                  )}
                </div>
              </div>

              {/* Package Details Display */}
              {watchedPackageType && (
                <div className="bg-gradient-to-r from-primary-50 to-accent-50 dark:from-primary-950/30 dark:to-accent-950/30 border-2 border-primary-200 dark:border-primary-500/30 rounded-2xl p-6 backdrop-blur-sm">
                  <div className="grid grid-cols-2 gap-6 text-center">
                    <div>
                      <span className="block text-lg font-semibold text-primary-900 dark:text-primary-100 mb-1">Expected Submissions</span>
                      <div className="text-3xl font-bold text-primary-700 dark:text-primary-300">
                        {watchedPackageType === 'PACKAGE_1' ? '30' : 
                         watchedPackageType === 'PACKAGE_2' ? '60' : '90'}
                      </div>
                    </div>
                    <div>
                      <span className="block text-lg font-semibold text-primary-900 dark:text-primary-100 mb-1">Final Designs</span>
                      <div className="text-3xl font-bold text-primary-700 dark:text-primary-300">
                        {selectedService === 'LOGO' ? '1' : 
                         watchedPackageType === 'PACKAGE_1' ? '1' : 
                         watchedPackageType === 'PACKAGE_2' ? '2' : '3'}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Brand Guidelines */}
          <Card className="card-glass">
            <CardHeader>
              <CardTitle className="text-3xl">Brand Guidelines</CardTitle>
              <CardDescription className="text-lg">
                Upload your brand assets and provide style guidelines
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              <div>
                <label className="block text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-3">
                  Brand Description
                </label>
                <textarea
                  {...register('brandData.description')}
                  rows={3}
                  placeholder="Describe your brand style, personality, and any specific requirements..."
                  className="w-full px-4 py-3 border-2 border-neutral-200 dark:border-neutral-700 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all duration-200 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-500 dark:placeholder:text-neutral-400"
                />
              </div>

              {/* Brand Colors */}
              <div>
                <label className="block text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-3">
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
                <label className="block text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-3">
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
          <div className="flex justify-end gap-6">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => router.back()}
              size="lg"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              variant="primary"
              disabled={isLoading}
              size="lg"
            >
              {isLoading ? 'Creating Contest...' : 'Create Contest'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
