'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { CardVibrant } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

export default function SignUpPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        // Redirect based on role
        if (formData.role === 'DESIGNER') {
          router.push('/designer/dashboard');
        } else {
          router.push('/dashboard');
        }
      } else {
        setError(data.message || 'Sign up failed');
      }
    } catch (error) {
      setError('An error occurred during sign up');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 bg-pattern-dots opacity-20"></div>
      <div className="absolute top-20 left-10 w-72 h-72 bg-blob rounded-full opacity-40 animate-float"></div>
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-blob-accent rounded-full opacity-30 animate-float" style={{ animationDelay: '2s' }}></div>
      <div className="absolute top-1/2 left-1/4 w-48 h-48 bg-blob-success rounded-full opacity-30 animate-float" style={{ animationDelay: '4s' }}></div>
      
      <div className="max-w-md w-full space-y-8 relative z-10">
        <div className="text-center">
          <h1 className="text-4xl font-bold gradient-text mb-2">Social Media Contest App</h1>
          <p className="text-xl text-neutral-600">Create your account</p>
        </div>
        
        <CardVibrant className="animate-fade-in-scale">
          <div className="p-8">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold gradient-text-primary">Sign Up</h2>
              <p className="text-neutral-600 mt-2">Create an account to start creating or participating in contests</p>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-neutral-700 mb-2">
                  Full Name
                </label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="John Doe"
                  required
                  className="form-field-modern"
                />
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-neutral-700 mb-2">
                  Email Address
                </label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="your@email.com"
                  required
                  className="form-field-modern"
                />
              </div>
              
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-neutral-700 mb-2">
                  Password
                </label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Create a strong password"
                  required
                  className="form-field-modern"
                />
              </div>
              
              <div>
                <label htmlFor="role" className="block text-sm font-medium text-neutral-700 mb-2">
                  I am a...
                </label>
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  required
                  className="form-field-modern w-full"
                >
                  <option value="">Select your role</option>
                  <option value="USER">Business Owner (Create Contests)</option>
                  <option value="DESIGNER">Designer (Submit Designs)</option>
                </select>
              </div>
              
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}
              
              <Button
                type="submit"
                variant="vibrant"
                size="xl"
                className="w-full"
                disabled={loading}
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </Button>
            </form>
            
            <div className="mt-6 text-center">
              <p className="text-sm text-neutral-600">
                Already have an account?{' '}
                <Link href="/auth/signin" className="text-primary-600 hover:text-primary-700 font-medium">
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </CardVibrant>
      </div>
    </div>
  );
}
