'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 bg-pattern-dots opacity-30"></div>
      <div className="absolute top-20 left-10 w-72 h-72 bg-blob rounded-full opacity-60 animate-float"></div>
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-blob-accent rounded-full opacity-40 animate-float" style={{ animationDelay: '2s' }}></div>
      <div className="absolute top-1/2 left-1/4 w-48 h-48 bg-blob-success rounded-full opacity-30 animate-float" style={{ animationDelay: '4s' }}></div>
      
      <div className="relative z-10 container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-20">
          <h1 className="text-6xl md:text-7xl font-bold mb-8 animate-fade-in-scale">
            <span className="gradient-text">Social Media</span>
            <br />
            <span className="gradient-text-accent">Contest App</span>
          </h1>
          <p className="text-xl md:text-2xl text-neutral-700 max-w-4xl mx-auto mb-10 leading-relaxed">
            A contest-based marketplace for creating Instagram and TikTok content. 
            Business owners create contests, designers submit amazing work, and everyone wins.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/auth/signup">
              <Button variant="vibrant" size="xl" className="animate-bounce-gentle">
                Get Started
              </Button>
            </Link>
            <Link href="/auth/signin">
              <Button variant="glass" size="xl">
                Sign In
              </Button>
            </Link>
          </div>
        </div>

        {/* Features Section */}
        <div className="mb-20">
          <h2 className="section-header text-center mb-16">Why Choose Our Platform?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="card-vibrant p-8 text-center group hover:scale-105 transition-transform duration-300">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:shadow-xl transition-all duration-300">
                <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-neutral-900 mb-4">Lightning Fast</h3>
              <p className="text-neutral-600 leading-relaxed">
                Get your content in days, not weeks. Our streamlined process ensures quick turnaround times.
              </p>
            </div>

            <div className="card-vibrant p-8 text-center group hover:scale-105 transition-transform duration-300">
              <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:shadow-xl transition-all duration-300">
                <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-neutral-900 mb-4">Quality Assured</h3>
              <p className="text-neutral-600 leading-relaxed">
                Every submission is reviewed by experts. Only the best designs make it to your brand.
              </p>
            </div>

            <div className="card-vibrant p-8 text-center group hover:scale-105 transition-transform duration-300">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-400 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:shadow-xl transition-all duration-300">
                <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-neutral-900 mb-4">Global Talent</h3>
              <p className="text-neutral-600 leading-relaxed">
                Access creative professionals from around the world. Diverse perspectives, unique designs.
              </p>
            </div>
          </div>
        </div>

        {/* How It Works Section */}
        <div className="mb-20">
          <h2 className="section-header text-center mb-16">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <span className="text-2xl font-bold text-white">1</span>
              </div>
              <h3 className="text-xl font-bold text-neutral-900 mb-4">Create Contest</h3>
              <p className="text-neutral-600">
                Business owners set requirements, budget, and timeline for their design contest.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-accent-400 to-accent-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <span className="text-2xl font-bold text-white">2</span>
              </div>
              <h3 className="text-xl font-bold text-neutral-900 mb-4">Designers Submit</h3>
              <p className="text-neutral-600">
                Creative professionals submit their best work based on your specifications.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <span className="text-2xl font-bold text-white">3</span>
              </div>
              <h3 className="text-xl font-bold text-neutral-900 mb-4">Choose Winner</h3>
              <p className="text-neutral-600">
                Review submissions and select the perfect design for your brand.
              </p>
            </div>
          </div>
        </div>

        {/* Why Choose Us Section */}
        <div className="mb-20">
          <h2 className="section-header text-center mb-16">Why Choose Us?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-neutral-900 mb-2">Competitive Pricing</h4>
                  <p className="text-neutral-600">Get professional designs at a fraction of traditional agency costs.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-gradient-to-br from-accent-400 to-accent-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-neutral-900 mb-2">Multiple Options</h4>
                  <p className="text-neutral-600">Choose from multiple design concepts, not just one.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-neutral-900 mb-2">Fast Delivery</h4>
                  <p className="text-neutral-600">Receive your designs in days, not weeks or months.</p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-neutral-900 mb-2">Quality Control</h4>
                  <p className="text-neutral-600">Every submission is reviewed by design experts.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-neutral-900 mb-2">Revisions Included</h4>
                  <p className="text-neutral-600">Get unlimited revisions until you're 100% satisfied.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-gradient-to-br from-red-400 to-red-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-neutral-900 mb-2">Money Back Guarantee</h4>
                  <p className="text-neutral-600">Not satisfied? Get your money back, no questions asked.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <div className="card-success p-12 max-w-4xl mx-auto">
            <h2 className="text-4xl font-bold text-green-800 mb-6">Ready to Get Started?</h2>
            <p className="text-xl text-green-700 mb-8">
              Join thousands of businesses and designers who trust our platform for their creative needs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/signup">
                <Button variant="vibrant" size="xl">
                  Start Your Contest
                </Button>
              </Link>
              <Link href="/auth/signup?role=designer">
                <Button variant="outline" size="xl">
                  Join as Designer
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}