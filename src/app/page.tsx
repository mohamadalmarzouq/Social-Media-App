'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      if (session.user.role === 'DESIGNER') {
        router.push('/designer/dashboard');
      } else {
        router.push('/dashboard');
      }
    }
  }, [session, status, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (status === 'authenticated') {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Social Media Contest App
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            A contest-based marketplace for creating Instagram and TikTok content. 
            Business owners create contests, designers submit amazing work, and everyone wins.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/auth/signup">
              <Button variant="primary" size="lg">
                Get Started
              </Button>
            </Link>
            <Link href="/auth/signin">
              <Button variant="outline" size="lg">
                Sign In
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">For Business Owners</CardTitle>
              <CardDescription>
                Get high-quality social media content without the back-and-forth
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  Create contests for Instagram & TikTok content
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  Upload your brand guidelines once
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  Review submissions in 3 rounds
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  Accept, pass, or comment until quota is reached
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  Download ready-to-post files in correct formats
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">For Designers</CardTitle>
              <CardDescription>
                Showcase your creativity and get paid for great work
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">★</span>
                  Browse active contests
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">★</span>
                  Download brand files and guidelines
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">★</span>
                  Submit designs in multiple rounds
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">★</span>
                  Receive feedback and iterate
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">★</span>
                  Get paid when your designs are accepted
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        <div className="mt-16 text-center">
          <h2 className="text-3xl font-semibold text-gray-900 mb-8">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 text-blue-600 w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                1
              </div>
              <h3 className="text-xl font-semibold mb-2">Round 1: Initial Submissions</h3>
              <p className="text-gray-600">Designers submit their initial concepts based on your brief</p>
            </div>
            <div className="text-center">
              <div className="bg-blue-100 text-blue-600 w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                2
              </div>
              <h3 className="text-xl font-semibold mb-2">Round 2: Refinement</h3>
              <p className="text-gray-600">Selected designers refine their work based on your feedback</p>
            </div>
            <div className="text-center">
              <div className="bg-blue-100 text-blue-600 w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                3
              </div>
              <h3 className="text-xl font-semibold mb-2">Round 3: Final</h3>
              <p className="text-gray-600">Finalists deliver polished designs ready for posting</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}