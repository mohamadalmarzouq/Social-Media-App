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
      packageQuota: 5,
      expectedSubmissions: 20,
      brandData: {
        colors: [],
        fonts: [],
      },
    },
  });

  const [colors, setColors] = useState<string[]>([]);
  const [fonts, setFonts] = useState<string[]>([]);
  const [colorInput, setColorInput] = useState('');
  const [fontInput, setFontInput] = useState('');

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

  const addColor = () => {
    if (colorInput && !colors.includes(colorInput) && colors.length < 10) {
      const newColors = [...colors, colorInput];
      setColors(newColors);
      setValue('brandData.colors', newColors);
      setColorInput('');
    }
  };

  const removeColor = (index: number) => {
    const newColors = colors.filter((_, i) => i !== index);
    setColors(newColors);
    setValue('brandData.colors', newColors);
  };

  const addFont = () => {
    if (fontInput && !fonts.includes(fontInput) && fonts.length < 5) {
      const newFonts = [...fonts, fontInput];
      setFonts(newFonts);
      setValue('brandData.fonts', newFonts);
      setFontInput('');
    }
  };

  const removeFont = (index: number) => {
    const newFonts = fonts.filter((_, i) => i !== index);
    setFonts(newFonts);
    setValue('brandData.fonts', newFonts);
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
                  placeholder="e.g., Instagram Posts for Summer Menu Launch"
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
                    Platform
                  </label>
                  <select
                    {...register('platform')}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.platform ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Select platform</option>
                    <option value="INSTAGRAM">Instagram (1080x1080)</option>
                    <option value="TIKTOK">TikTok (1080x1920)</option>
                  </select>
                  {errors.platform && (
                    <p className="mt-1 text-sm text-red-600">{errors.platform.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Final Designs Needed
                  </label>
                  <Input
                    {...register('packageQuota', { valueAsNumber: true })}
                    type="number"
                    min="1"
                    max="50"
                    className={errors.packageQuota ? 'border-red-500' : ''}
                  />
                  {errors.packageQuota && (
                    <p className="mt-1 text-sm text-red-600">{errors.packageQuota.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Expected Submissions
                  </label>
                  <Input
                    {...register('expectedSubmissions', { valueAsNumber: true })}
                    type="number"
                    min="5"
                    max="100"
                    className={errors.expectedSubmissions ? 'border-red-500' : ''}
                  />
                  {errors.expectedSubmissions && (
                    <p className="mt-1 text-sm text-red-600">{errors.expectedSubmissions.message}</p>
                  )}
                </div>
              </div>
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
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <Input
                      type="text"
                      value={colorInput}
                      onChange={(e) => setColorInput(e.target.value)}
                      placeholder="Enter hex color (e.g., #FF5733)"
                      className="flex-1"
                    />
                    <Button 
                      type="button" 
                      onClick={addColor}
                      variant="outline"
                      disabled={colors.length >= 10}
                    >
                      Add Color
                    </Button>
                  </div>
                  
                  {colors.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {colors.map((color, index) => (
                        <div key={index} className="flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-2">
                          <div 
                            className="w-6 h-6 rounded border border-gray-300" 
                            style={{ backgroundColor: color }}
                          ></div>
                          <span className="text-sm font-mono">{color}</span>
                          <button
                            type="button"
                            onClick={() => removeColor(index)}
                            className="text-red-500 hover:text-red-700 ml-2"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Brand Fonts */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Brand Fonts
                </label>
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <Input
                      type="text"
                      value={fontInput}
                      onChange={(e) => setFontInput(e.target.value)}
                      placeholder="Enter font name (e.g., Arial, Helvetica)"
                      className="flex-1"
                    />
                    <Button 
                      type="button" 
                      onClick={addFont}
                      variant="outline"
                      disabled={fonts.length >= 5}
                    >
                      Add Font
                    </Button>
                  </div>
                  
                  {fonts.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {fonts.map((font, index) => (
                        <div key={index} className="flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-2">
                          <span className="text-sm">{font}</span>
                          <button
                            type="button"
                            onClick={() => removeFont(index)}
                            className="text-red-500 hover:text-red-700 ml-2"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
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
