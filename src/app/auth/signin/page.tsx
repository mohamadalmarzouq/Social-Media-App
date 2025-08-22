'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { CardVibrant } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

export default function SignInPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Check if this is an admin login attempt
      const isAdminLogin = formData.email === process.env.NEXT_PUBLIC_ADMIN_USERNAME || 
                          formData.email === 'admin' || 
                          formData.email === 'admin@admin.com';

      if (isAdminLogin) {
        // Admin authentication
        const adminResponse = await fetch('/api/admin/auth', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            username: formData.email, 
            password: formData.password 
          }),
        });

        const adminData = await adminResponse.json();

        if (adminData.success) {
          router.push('/admin/dashboard');
        } else {
          setError(adminData.message || 'Invalid admin credentials');
        }
      } else {
        // Regular user authentication
        const userResponse = await fetch('/api/auth/signin', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });

        const userData = await userResponse.json();

        if (userData.success) {
          // Redirect based on user role
          if (userData.user.role === 'DESIGNER') {
            router.push('/designer/dashboard');
          } else {
            router.push('/dashboard');
          }
        } else {
          setError(userData.message || 'Invalid email or password');
        }
      }
    } catch (error) {
      setError('An error occurred during sign in');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
          <p className="text-xl text-neutral-600">Sign in to your account</p>
        </div>
        
        <CardVibrant className="animate-fade-in-scale">
          <div className="p-8">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold gradient-text-primary">Sign In</h2>
              <p className="text-neutral-600 mt-2">Access your contests and submissions</p>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-neutral-700 mb-2">
                  Email Address or Username
                </label>
                <Input
                  id="email"
                  name="email"
                  type="text"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email or username"
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
                  placeholder="Enter your password"
                  required
                  className="form-field-modern"
                />
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
                {loading ? 'Signing In...' : 'Sign In'}
              </Button>
            </form>
            
            <div className="mt-6 text-center">
              <p className="text-sm text-neutral-600">
                Don't have an account?{' '}
                <Link href="/auth/signup" className="text-primary-600 hover:text-primary-700 font-medium">
                  Sign up
                </Link>
              </p>
            </div>
          </div>
        </CardVibrant>
      </div>
    </div>
  );
}
